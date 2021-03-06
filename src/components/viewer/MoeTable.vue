<template>
	<div>
		<section class="columns section wrapper">
			<b-table
				class="column is-10 is-offset-1"
				detail-key="name"
				custom-detail-row
				detailed
				:data="createTableData()"
				ref="table"
				:show-detail-icon="false"
			>
				<template slot-scope="props">
					<b-table-column v-if="props.row.isButton" colspan="8">
						<div class="columns button-wrapper">
							<b-tooltip
								class="column is-offset-1 is-10"
								label="Add new character"
								position="is-bottom"
								type="is-link"
							>
								<b-button
									@click="addCharacter(props.row)"
									expanded
									size="is-large"
									icon-left="plus-circle-outline"
									type="is-text"
								/>
							</b-tooltip>
						</div>
					</b-table-column>
					<template v-else>
						<b-table-column width="100">
							<a @click="toggle(props.row)"> {{ getTextForCharacter(props.row) }}</a>
						</b-table-column>
						<b-table-column field="name" label="Name" width="600" sortable searchable>
							<input
								v-if="props.row.editing"
								class="text-input input"
								type="text"
								v-model="props.row.newName"
							/>
							<div v-else>{{ props.row.name }}</div>
						</b-table-column>
						<b-table-column field="origin" label="Origin" width="600" sortable searchable>
							<input
								v-if="props.row.editing"
								class="text-input input"
								type="text"
								v-model="props.row.newOrigin"
							/>
							<div v-else>{{ props.row.origin }}</div>
						</b-table-column>
						<b-table-column
							v-if="props.row.editing"
							field="imageurl"
							label="Image"
							width="200"
							@click.native="enlargeImage(props.row.newImageUrl)"
						>
							<input
								@click.stop
								class="input"
								@input="refreshTable"
								v-model="props.row.newImageUrl"
								type="text"
							/>
							<b-tooltip label="Click to enlarge" position="is-left" type="is-link">
								<img :alt="props.row.name" :src="props.row.newImageUrl" />
							</b-tooltip>
						</b-table-column>
						<b-table-column
							v-else
							field="imageurl"
							label="Image"
							width="200"
							@click.native="enlargeImage(props.row.imageUrl)"
						>
							<b-tooltip label="Click to enlarge" position="is-left" type="is-link">
								<img :alt="props.row.name" :src="props.row.imageUrl" />
							</b-tooltip>
						</b-table-column>
						<b-table-column width="20">
							<b-tooltip v-if="!props.row.editing" label="Edit" type="is-link" position="is-right">
								<b-button
									@click="editCharacter(props.row)"
									size="medium"
									icon-left="pencil"
									type="is-text"
								/>
							</b-tooltip>
							<div v-else>
								<b-tooltip label="Save" type="is-link" position="is-right">
									<b-button
										@click="saveChanges(props.row)"
										size="medium"
										icon-left="content-save"
										type="is-text"
									/>
								</b-tooltip>
								<b-tooltip label="Discard" type="is-link" position="is-right">
									<b-button
										@click="discardChanges(props.row)"
										size="medium"
										icon-left="undo"
										type="is-text"
									/>
								</b-tooltip>
								<b-tooltip label="Delete" type="is-link" position="is-right">
									<b-button
										@click="deleteCharacter(props.row)"
										size="medium"
										icon-left="delete"
										type="is-text"
									/>
								</b-tooltip>
							</div>
						</b-table-column>
					</template>
				</template>
				<template slot="detail" slot-scope="props">
					<tr class="sub-character-row" v-for="variant in props.row.variants" :key="variant.name">
						<td>Variant of {{ props.row.name }}</td>
						<td>
							<input
								v-if="props.row.editing"
								class="text-input input"
								type="text"
								v-model="variant.newName"
							/>
							<div v-else>{{ variant.name }}</div>
						</td>
						<td>{{ props.row.origin }}</td>
						<td v-if="props.row.editing">
							<input
								@click.stop
								class="input"
								@input="refreshTable"
								v-model="variant.newImageUrl"
								type="text"
							/>
							<b-tooltip label="Click to enlarge" position="is-left" type="is-link">
								<img @click="enlargeImage(variant.newImageUrl)" :src="variant.newImageUrl" alt="" />
							</b-tooltip>
						</td>
						<td v-else>
							<b-tooltip label="Click to enlarge" position="is-left" type="is-link">
								<img @click="enlargeImage(variant.imageUrl)" :src="variant.imageUrl" alt="" />
							</b-tooltip>
						</td>
						<td>
							<b-tooltip v-if="props.row.editing" label="Remove" type="is-link" position="is-right">
								<b-button
									@click="removeVariant(props.row, variant)"
									size="medium"
									icon-left="delete"
									type="is-text"
								/>
							</b-tooltip>
						</td>
					</tr>
					<template v-if="props.row.editing">
						<tr v-for="(newVariant, index) in props.row.newVariants" :key="'variant' + index">
							<td>New Variant for {{ props.row.name }}</td>
							<td><input class="text-input input" type="text" v-model="newVariant.name" /></td>
							<td>{{ props.row.origin }}</td>
							<td>
								<input
									@input="updateNewVariantImage(props.row, index, newVariant, $event)"
									@click.stop
									class="input"
									type="text"
									v-model="newVariant.imageUrl"
								/>
								<b-tooltip label="Click to enlarge" position="is-left" type="is-link">
									<img
										@click="enlargeImage(newVariant.imageUrl)"
										:src="newVariant.imageUrl"
										alt=""
										:ref="props.row.name + index + '_new_variant'"
									/>
								</b-tooltip>
							</td>
							<td>
								<b-tooltip
									v-if="index === props.row.newVariants.length - 1"
									label="Add"
									type="is-link"
									position="is-right"
								>
									<b-button
										@click="addNewVariant(props.row)"
										size="medium"
										icon-left="plus"
										type="is-text"
									/>
								</b-tooltip>
								<b-tooltip v-if="index !== 0" label="Remove" type="is-link" position="is-right">
									<b-button
										@click="removeNewVariant(props.row, newVariant)"
										size="medium"
										icon-left="delete"
										type="is-text"
									/>
								</b-tooltip>
							</td>
						</tr>
					</template>
					<tr class="sub-character-row" v-for="partner in props.row.partners" :key="partner.name">
						<td>Partner of {{ props.row.name }}</td>
						<td>
							<input
								v-if="props.row.editing"
								class="text-input input"
								type="text"
								v-model="partner.newName"
							/>
							<div v-else>{{ partner.name }}</div>
						</td>
						<td>{{ props.row.origin }}</td>
						<td v-if="props.row.editing">
							<input
								@click.stop
								@input="refreshTable"
								class="input"
								v-model="partner.newImageUrl"
								type="text"
							/>
							<b-tooltip label="Click to enlarge" position="is-left" type="is-link">
								<img @click="enlargeImage(partner.newImageUrl)" :src="partner.newImageUrl" alt="" />
							</b-tooltip>
						</td>
						<td v-else>
							<b-tooltip label="Click to enlarge" position="is-left" type="is-link">
								<img @click="enlargeImage(partner.imageUrl)" :src="partner.imageUrl" alt="" />
							</b-tooltip>
						</td>
						<td>
							<b-tooltip v-if="props.row.editing" label="Remove" type="is-link" position="is-right">
								<b-button
									@click="removePartner(props.row, partner)"
									size="medium"
									icon-left="delete"
									type="is-text"
								/>
							</b-tooltip>
						</td>
					</tr>
					<template v-if="props.row.editing">
						<tr v-for="(newPartner, index) in props.row.newPartners" :key="'partner' + index">
							<td>New Partner for {{ props.row.name }}</td>
							<td><input class="text-input input" type="text" v-model="newPartner.name" /></td>
							<td>{{ props.row.origin }}</td>
							<td>
								<input
									@input="updateNewPartnerImage(props.row, index, newPartner, $event)"
									@click.stop
									class="input"
									type="text"
									v-model="newPartner.imageUrl"
								/>
								<img
									@click="enlargeImage(newPartner.imageUrl)"
									:src="newPartner.imageUrl"
									alt=""
									:ref="props.row.name + index + '_new_partner'"
								/>
							</td>
							<td>
								<b-tooltip
									v-if="index === props.row.newPartners.length - 1"
									label="Add"
									type="is-link"
									position="is-right"
								>
									<b-button
										@click="addNewPartner(props.row)"
										size="medium"
										icon-left="plus"
										type="is-text"
									/>
								</b-tooltip>
								<b-tooltip v-if="index !== 0" label="Remove" type="is-link" position="is-right">
									<b-button
										@click="removeNewPartner(props.row, newPartner)"
										size="medium"
										icon-left="delete"
										type="is-text"
									/>
								</b-tooltip>
							</td>
						</tr>
					</template>
				</template>
			</b-table>
		</section>
		<b-modal @close="imageToEnlarge = ''" :active.sync="modalIsActive" scroll="keep">
			<section @click="modalIsActive = false" class="section modal-section has-text-centered">
				<img @click.stop class="enlarged-image" :src="imageToEnlarge" alt="enlargedImage" />
			</section>
		</b-modal>
	</div>
</template>

<script lang="ts">
	// Vue basics
	import { Component, Vue, Prop } from "vue-property-decorator";
	// models
	import { Character, SubCharacter } from "@/models/Character";

	@Component({
		components: {}
	})
	export default class MoeTable extends Vue {
		@Prop({ required: true, default: [], type: Array })
		characters!: Array<Character>;

		private modalIsActive: boolean = false;

		private imageToEnlarge: string = "";

		private toggle(row: Character): void {
			row.detailsOpened = !row.detailsOpened;
			(this.$refs.table as any).toggleDetails(row);
		}
		private enlargeImage(url: string): void {
			this.imageToEnlarge = url;
			this.modalIsActive = true;
		}
		private changed() {
			this.$emit("changed");
		}
		private editCharacter(character: Character): void {
			character.editing = true;
			character.newName = character.name;
			character.newOrigin = character.origin;
			character.newImageUrl = character.imageUrl;
			character.newVariants = [{ name: "", imageUrl: "" }];
			character.newPartners = [{ name: "", imageUrl: "" }];
			character.variants.forEach((variant: SubCharacter) => {
				variant.newName = variant.name;
				variant.newImageUrl = variant.imageUrl;
			});
			character.partners.forEach((partner: SubCharacter) => {
				partner.newName = partner.name;
				partner.newImageUrl = partner.imageUrl;
			});
			(this.$refs.table as any).resetMultiSorting();
			if (!character.detailsOpened) {
				this.toggle(character);
			}
		}
		private saveChanges(character: Character): void {
			character.editing = false;
			character.name = character.newName ? character.newName : character.name;
			character.origin = character.newOrigin ? character.newOrigin : character.origin;
			character.imageUrl = character.newImageUrl ? character.newImageUrl : character.imageUrl;
			character.variants.forEach((variant: SubCharacter) => {
				variant.name = variant.newName ? variant.newName : variant.name;
				variant.imageUrl = variant.newImageUrl ? variant.newImageUrl : variant.imageUrl;
			});
			character.partners.forEach((partner: SubCharacter) => {
				partner.name = partner.newName ? partner.newName : partner.name;
				partner.imageUrl = partner.newImageUrl ? partner.newImageUrl : partner.imageUrl;
			});
			if (character.newVariants !== undefined && character.newVariants.length > 0) {
				character.newVariants.forEach(newVariant => {
					if (newVariant.name !== "") {
						character.variants.push(newVariant);
					}
				});
			}
			if (character.newPartners !== undefined && character.newPartners.length > 0) {
				character.newPartners.forEach(newPartner => {
					if (newPartner.name !== "") {
						character.partners.push(newPartner);
					}
				});
			}
			character.newName = undefined;
			character.newOrigin = undefined;
			character.newImageUrl = undefined;
			character.newVariants = undefined;
			character.newPartners = undefined;
			(this.$refs.table as any).resetMultiSorting();
			this.changed();
		}
		private discardChanges(character: Character): void {
			character.editing = false;
			character.newName = undefined;
			character.newOrigin = undefined;
			character.newImageUrl = undefined;
			character.newVariants = undefined;
			character.newPartners = undefined;
			character.variants.forEach((variant: SubCharacter) => {
				variant.newName = undefined;
				variant.newImageUrl = undefined;
			});
			character.partners.forEach((partner: SubCharacter) => {
				partner.newName = undefined;
				partner.newImageUrl = undefined;
			});
			(this.$refs.table as any).resetMultiSorting();
			if (character.detailsOpened) {
				this.toggle(character);
			}
		}
		private updateNewVariantImage(
			character: Character,
			index: number,
			newVariant: SubCharacter,
			event: InputEvent
		): void {
			newVariant.imageUrl = (event.target as HTMLFormElement).value;
			(this.$refs[
				character.name + index + "_new_variant"
			] as HTMLImageElement).src = (event.target as HTMLFormElement).value;
			(this.$refs.table as any).resetMultiSorting();
		}
		private updateNewPartnerImage(
			character: Character,
			index: number,
			newPartner: SubCharacter,
			event: InputEvent
		): void {
			newPartner.imageUrl = (event.target as HTMLFormElement).value;
			(this.$refs[
				character.name + index + "_new_partner"
			] as HTMLImageElement).src = (event.target as HTMLFormElement).value;
			(this.$refs.table as any).resetMultiSorting();
		}
		private getTextForCharacter(character: Character): string {
			if (character.editing || character.variants.length > 0 || character.partners.length > 0) {
				if (character.detailsOpened) {
					return "Hide sub characters";
				} else {
					return "Show sub characters";
				}
			} else {
				return "";
			}
		}
		private deleteCharacter(character: Character): void {
			this.$buefy.dialog.confirm({
				message: `Are you sure you wish to delete ${character.name}?`,
				trapFocus: true,
				type: "is-link",
				onConfirm: value => {
					this.characters.splice(this.characters.indexOf(character), 1);
					this.changed();
				}
			});
		}
		private addNewVariant(character: Character): void {
			if (!character.newVariants) {
				character.newVariants = [];
			}
			character.newVariants.push({ name: "", imageUrl: "" });
			(this.$refs.table as any).resetMultiSorting();
		}
		private removeNewVariant(character: Character, variant: SubCharacter): void {
			if (character.newVariants) {
				character.newVariants.splice(character.newVariants.indexOf(variant), 1);
			}
			(this.$refs.table as any).resetMultiSorting();
		}
		private removeVariant(character: Character, variant: SubCharacter): void {
			character.variants.splice(character.variants.indexOf(variant), 1);
			(this.$refs.table as any).resetMultiSorting();
		}
		private addNewPartner(character: Character): void {
			if (!character.newPartners) {
				character.newPartners = [];
			}
			character.newPartners.push({ name: "", imageUrl: "" });
			(this.$refs.table as any).resetMultiSorting();
		}
		private removeNewPartner(character: Character, partner: SubCharacter): void {
			if (character.newPartners) {
				character.newPartners.splice(character.newPartners.indexOf(partner), 1);
			}
			(this.$refs.table as any).resetMultiSorting();
		}
		private removePartner(character: Character, partner: SubCharacter): void {
			character.partners.splice(character.partners.indexOf(partner), 1);
			(this.$refs.table as any).resetMultiSorting();
		}
		private createTableData(): Array<any> {
			const array: Array<any> = [{ isFirst: true, isButton: true }];

			const array2 = array.concat(this.characters);

			return array2.concat([
				{
					isLast: true,
					isButton: true
				}
			]);
		}
		private addCharacter(row: any): void {
			const character: Character = {
				name: "",
				origin: "",
				partners: [],
				variants: [],
				// partners: [{ name: "" }],
				// variants: [{ name: "" }],
				editing: false,
				detailsOpened: false
			};
			if (row.isFirst) {
				this.characters.unshift(character);
			} else if (row.isLast) {
				this.characters.push(character);
			}
			this.editCharacter(character);
			(this.$refs.table as Vue).$forceUpdate();
			this.$forceUpdate();
		}
		private refreshTable(): void {
			(this.$refs.table as any).resetMultiSorting();
		}
	}
</script>

<style lang="scss" scoped>
	/deep/.mdi {
		color: #00ffff;
	}
	.sub-character-row {
		background-color: #202020;
	}
	.enlarged-image {
		max-height: 85vh;
	}
	.text-input {
		width: fit-content;
	}
	.wrapper {
		max-width: 99.7vw;
		padding-right: unset;
		padding-left: unset;
	}
	.button-wrapper {
		max-width: 99.7vw;
		padding-right: unset;
		padding-left: unset;
	}
</style>
