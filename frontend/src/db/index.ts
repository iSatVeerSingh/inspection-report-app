import Dexie, { Table } from "dexie";
import {
  InspectionItem,
  InspectionNote,
  Job,
  JobCategory,
  LibraryItem,
  LibraryItemCategory,
  Recommendation,
} from "../types";

export class InspectionDatabase extends Dexie {
  user!: Table<any>;
  libraryItemCategories!: Table<LibraryItemCategory>;
  libraryItems!: Table<LibraryItem>;
  inspectionNotes!: Table<InspectionNote>;
  jobs!: Table<Job>;
  jobCategories!: Table<JobCategory>;
  inspectionItems!: Table<InspectionItem>;
  recommendations!: Table<Recommendation>;
  template!: Table<any>;

  constructor() {
    super("inspection-db");
    this.version(7).stores({
      user: "++type",
      libraryItemCategories: "++id, name",
      libraryItems:
        "++id, [name+category], [category_id+updated_at], updated_at",
      inspectionNotes: "++id, category_id",
      jobs: "++jobNumber, id, [status+category+startsAt], [status+category], [status+startsAt], [category+startsAt]",
      jobCategories: "++id",
      inspectionItems:
        "++uuid, job_id, library_item_id, isCustom, [job_id+isPreviousItem+category]",
      recommendations: "++id",
      template: "++type"
    });
  }
}

export const DB = new InspectionDatabase();
