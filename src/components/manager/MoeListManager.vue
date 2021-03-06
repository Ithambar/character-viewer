<template>
	<div>
		<div class="columns section wrapper">
			<b-table class="column is-half is-offset-3" ref="table" :data="collection.lists">
				<template slot-scope="props">
					<b-table-column field="id" label="ID" width="150">
						<div class="text-column">
							<a @click="openList(props.row)">{{ props.row.id }}</a>
						</div>
					</b-table-column>
					<b-table-column field="name" label="Name" width="150">
						<b-field>
							<b-input
								placeholder="List name"
								:value="props.row.name"
								type="text"
								icon-right="content-save"
								icon-right-clickable
								@icon-right-click="renameList(props.row, $event)"
							>
							</b-input>
						</b-field>
					</b-table-column>
					<b-table-column width="30">
						<b-tooltip label="View" position="is-top" type="is-link">
							<b-button @click="openList(props.row)" size="medium" icon-left="magnify" type="is-text" />
						</b-tooltip>
						<!-- <b-tooltip label="Export" position="is-top" type="is-link">
							<b-button @click="exportList(props.row)" size="medium" icon-left="export" type="is-text" />
						</b-tooltip>
						<b-tooltip label="Share" position="is-top" type="is-link">
							<b-button @click="shareList(props.row)" size="medium" icon-left="share" type="is-text" />
						</b-tooltip> -->
						<b-tooltip label="Delete" position="is-top" type="is-link">
							<b-button @click="deleteList(props.row)" size="medium" icon-left="delete" type="is-text" />
						</b-tooltip>
					</b-table-column>
				</template>
			</b-table>
		</div>
		<div class="columns button-wrapper">
			<b-tooltip class="column is-offset-3 is-2" label="Add new" position="is-bottom" type="is-link">
				<b-button expanded @click="addNewList" size="is-large" icon-left="plus-circle-outline" type="is-text" />
			</b-tooltip>
			<b-tooltip class="column is-2" label="Import from file" position="is-bottom" type="is-link">
				<b-button expanded @click="importFromFile" size="is-large" icon-left="import" type="is-text" />
			</b-tooltip>
			<b-tooltip class="column is-2" label="Import by id" position="is-bottom" type="is-link">
				<b-button expanded @click="importById" size="is-large" icon-left="import" type="is-text" />
			</b-tooltip>
		</div>
	</div>
</template>

<script lang="ts">
	// Vue basics
	import { Component, Vue, Prop, Watch } from "vue-property-decorator";
	import { List } from "../../models/List";
	import { v4 as uuidv4 } from "uuid";
	import { loadList, saveCollection, loadCollection } from "@/services/AjaxService";
	import { Collection } from "../../models/Collection";
	@Component({
		components: {}
	})
	export default class MoeListManager extends Vue {
		@Prop({ required: true })
		collection!: Collection;

		private renameList(list: List, event: MouseEvent): void {
			list.name = ((event.target as HTMLElement).parentElement!.previousElementSibling as HTMLInputElement).value;
			this.$buefy.toast.open({ message: "Name saved!", type: "is-link" });
			saveCollection(this.collection);
		}
		private deleteList(list: List) {
			this.$buefy.dialog.confirm({
				title: "Delete list",
				message: "This will permanently delete your list. Are you sure?",
				scroll: "keep",
				type: "is-link",
				ariaRole: "alertdialog",
				ariaModal: true,
				trapFocus: true,
				confirmText: "Delete",
				onConfirm: () => {
					this.collection.lists.splice(this.collection.lists.indexOf(list), 1);
					saveCollection(this.collection);
				}
			});
		}
		private addNewList() {
			this.$buefy.dialog.prompt({
				title: "New list",
				message: "Please enter a name for your list.",
				scroll: "keep",
				inputAttrs: {
					placeholder: "name"
				},
				confirmText: "Save",
				type: "is-link",
				ariaRole: "alertdialog",
				ariaModal: true,
				trapFocus: true,
				onConfirm: value => {
					this.collection.lists.push({ id: uuidv4(), name: value, characters: [] });
					saveCollection(this.collection);
				}
			});
		}
		private exportList(list: List): void {}
		private openList(list: List): void {
			this.$emit("open-list", list);
		}
		private shareList(list: List): void {}
		private importFromFile(): void {
			this.$buefy.dialog.prompt({
				message: "Paste the content of the file you wish to import into the textfield.",
				type: "is-link",
				title: "Import list from file",
				onConfirm: value => {
					this.collection.lists.push(JSON.parse(value) as List);
					saveCollection(this.collection);
				}
			});
		}
		private importById(): void {
			this.$buefy.dialog.prompt({
				title: "Load list by id",
				message: "Paste the id of the list you wish to load into the textfield.",
				confirmText: "Import",
				type: "is-link",
				ariaRole: "alertdialog",
				ariaModal: true,
				trapFocus: true,
				onConfirm: value => {
					loadList(value)
						.then(response => {
							this.collection.lists.push(response.data);
							saveCollection(this.collection);
						})
						.catch();
				}
			});
		}
	}
</script>

<style lang="scss" scoped>
	/deep/.mdi {
		color: #00ffff;
	}
	.text-column {
		padding-top: 0.4rem;
	}
	.wrapper {
		padding-bottom: unset;
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
