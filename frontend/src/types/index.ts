export type UserLogin = {
  email: string;
  password: string;
};

export type UserForm = {
  name: string;
  email: string;
  phone?: string;
  role: "Inspector" | "Owner" | "Admin";
  password: string;
};

export type User = UserForm & {
  id: number;
  created_at?: string;
  updated_at?: string;
};

export type Job = {
  id: string;
  jobNumber: string;
  type?: string | null;
  category_id: string;
  category: string;
  stageOfWorks?: string | null;
  customer: Customer;
  siteAddress: string;
  startsAt: string;
  status: JobStatus;
  completedAt: string | null;
  description: string;
  inspector: string;
  inspector_id: string;
  inspectionNotes?: string[];
  inspectionItems?: InspectionItem[] | number;
  previousJobs: string[];
  recommendation?: string;
};

export enum JobStatus {
  WORK_ORDER = "Work Order",
  IN_PROGRESS = "In Progress",
  NOT_SUBMITTED = "Not Submitted",
  COMPLETED = "Completed",
}

export type Customer = {
  nameOnReport: string;
  name: string;
  email: string;
  phone: string;
};

export type LibraryItem = {
  id: number;
  category_id?: number;
  category: string;
  name: string;
  openingParagraph: string;
  closingParagraph: string;
  embeddedImage?: string | null | File;
  summary?: string;
  created_at?: string;
  updated_at?: string;
};

export type LibraryItemCategory = {
  id: number;
  name: string;
  itemsCount?: number;
  created_at?: string;
  updated_at?: string;
};

export type JobCategory = Omit<LibraryItemCategory, "itemsCount">;

export type InspectionNote = {
  id: number;
  category_id: number;
  text: string;
  created_at?: string;
  updated_at?: string;
};

export type InspectionItemForm = {
  category: string;
  name: string;
  images: File[] | string[] | string;
  note?: string;
};

export type InspectionItem = Partial<LibraryItem> & {
  id?: number;
  uuid?: string;
  job_id: number;
  library_item_id?: number | null;
  isPreviousItem?: 0 | 1 | boolean;
  previous_job_id?: number;
  images?: string[] | File[] | string;
  note?: string;
  isCustom?: boolean;
  pageBreak?: boolean;
};

export type Recommendation = {
  id: number;
  active?: boolean;
  text: string;
  created_at: string;
  updated_at: string;
};

export type Paragraph = {
  text: {
    text: string;
    bold?: boolean;
    italics?: boolean;
    decoration?: string | string[];
  }[];
};
