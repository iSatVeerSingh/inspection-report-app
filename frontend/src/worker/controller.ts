// // // check init status
// // export const initStatusController: RouteHandler = async () => {
// //   try {
// //     const isExists = await Dexie.exists("inspection-db");
// //     if (!isExists) {
// //       return getSuccessResponse({ message: "Not Started" });
// //     }
// //     const count = await Db.libraryItems.count();
// //     if (count === 0) {
// //       return getSuccessResponse({ message: "Pending" });
// //     }
// //     return getSuccessResponse({ message: "Done" });
// //   } catch (err) {
// //     return getSuccessResponse({ message: "Not Started" });
// //   }
// // };

import { RouteHandler } from "workbox-core";
import { getBadRequestResponse, getSuccessResponse } from "./response";
import { DB } from "../db";
import { InspectionItem, Job, JobStatus, LibraryItem } from "../types";

// Setup user in indexeddb
export const initUserController: RouteHandler = async ({ request }) => {
  const userData = await request.json();

  if (!userData) {
    return getBadRequestResponse();
  }

  try {
    await DB.user.clear();
    const user = await DB.user.add({ type: "user", ...userData });
    if (!user) {
      return getBadRequestResponse();
    }
    return getSuccessResponse({ message: "User added to indexeddb" });
  } catch (err) {
    console.log(err);
    return getBadRequestResponse();
  }
};

// Setup library item categories
export const initLibraryItemCategoriesController: RouteHandler = async ({
  request,
}) => {
  const allCategories = await request.json();
  if (!allCategories) {
    return getBadRequestResponse();
  }
  try {
    await DB.libraryItemCategories.clear();
    await DB.libraryItemCategories.bulkAdd(allCategories);
    return getSuccessResponse({ message: "Categories added successfully" });
  } catch (err) {
    return getBadRequestResponse();
  }
};

// Setup library items
export const initLibraryItemsController: RouteHandler = async ({ request }) => {
  const allItems = (await request.json()) as LibraryItem[];
  if (!allItems) {
    return getBadRequestResponse();
  }

  try {
    await DB.libraryItems.clear();
    // await Db.libraryIndex.clear();
    await DB.libraryItems.bulkAdd(allItems);
    // const libIndexitems = allItems.map((item) => ({
    //   id: item.id,
    //   category_id: item.category_id,
    //   name: item.name,
    // }));

    // await Db.libraryIndex.bulkAdd(libIndexitems);
    return getSuccessResponse({ message: "Items added successfully" });
  } catch (err) {
    return getBadRequestResponse();
  }
};

// Setup library inspection notes
export const initInspectionNotesController: RouteHandler = async ({
  request,
}) => {
  const allInspectionNotes = await request.json();
  if (!allInspectionNotes) {
    return getBadRequestResponse();
  }
  try {
    await DB.inspectionNotes.clear();
    await DB.inspectionNotes.bulkAdd(allInspectionNotes);
    return getSuccessResponse({
      message: "Inspection notes added successfully",
    });
  } catch (err) {
    return getBadRequestResponse();
  }
};

// init jobs
export const initJobsController: RouteHandler = async ({ request }) => {
  const jobs = await request.json();
  if (!jobs) {
    return getBadRequestResponse();
  }
  try {
    await DB.jobs.clear();
    await DB.jobs.bulkAdd(jobs);
    return getSuccessResponse({
      message: "Jobs added successfully added successfully",
    });
  } catch (err) {
    return getBadRequestResponse();
  }
};

// init jobCategories
export const initJobCategoriesController: RouteHandler = async ({
  request,
}) => {
  const jobCategories = await request.json();
  if (!jobCategories) {
    return getBadRequestResponse();
  }
  try {
    await DB.jobCategories.clear();
    await DB.jobCategories.bulkAdd(jobCategories);
    return getSuccessResponse({ message: "Job Categories added successfully" });
  } catch (err) {
    return getBadRequestResponse();
  }
};

// Init Recommendations
export const initRecommendationsController: RouteHandler = async ({
  request,
}) => {
  const recommendations = await request.json();
  if (!recommendations) {
    return getBadRequestResponse();
  }

  try {
    await DB.recommendations.clear();
    await DB.recommendations.bulkAdd(recommendations);
    return getSuccessResponse({
      message: "Recommendations added successfully",
    });
  } catch (err: any) {
    return getBadRequestResponse(err.message);
  }
};

// Get Job categories
export const getJobCategoriesController: RouteHandler = async () => {
  try {
    const jobCategories = await DB.jobCategories.toArray();
    return getSuccessResponse(jobCategories);
  } catch (err: any) {
    return getBadRequestResponse(err);
  }
};

//get jobs
export const getJobsController: RouteHandler = async ({ url }) => {
  try {
    const jobNumber = url.searchParams.get("jobNumber");
    if (jobNumber) {
      const transaction = await DB.transaction(
        "rw",
        DB.jobs,
        DB.inspectionItems,
        async () => {
          const job = await DB.jobs.get(jobNumber);
          if (!job) {
            return null;
          }
          const inspectionItems = await DB.inspectionItems
            .where("job_id")
            .equals(job.id)
            .count();
          return {
            ...job,
            inspectionItems,
          } as Job;
        }
      );

      if (!transaction) {
        return getBadRequestResponse("No job found");
      }
      return getSuccessResponse(transaction);
      // const job = await DB.jobs.get(jobNumber);
      // if (!job) {
      //   return getSuccessResponse(null);
      // }
      // return getSuccessResponse(job);
    }

    const query = url.searchParams;
    const page = query.get("page");
    const status = query.get("status");
    const category = query.get("category");
    const startsAt = query.get("startsAt");

    const dbQuery = {
      status: status || "Work Order",
      ...(category ? { category } : {}),
      ...(startsAt ? { startsAt } : {}),
    };

    const perPage = 15;
    const pageNumber = Number(page);
    const skip = pageNumber === 0 ? 0 : (pageNumber - 1) * perPage;
    const jobsCollection = DB.jobs.where(dbQuery);
    const total = await jobsCollection.count();
    const totalPages =
      total % perPage === 0 ? total / perPage : Math.floor(total / perPage) + 1;

    const jobs = await jobsCollection
      .offset(skip)
      .limit(perPage)
      .sortBy("jobNumber");
    return getSuccessResponse({
      data: jobs,
      pages: totalPages,
      currentPage: pageNumber === 0 ? 1 : pageNumber,
    });
  } catch (err: any) {
    console.log(err);
    return getBadRequestResponse(err);
  }
};

// Start new inspection - Update job status to "In Progress"
export const startInspectionController: RouteHandler = async ({ url }) => {
  const jobNumber = url.searchParams.get("jobNumber");
  if (!jobNumber) {
    return getBadRequestResponse();
  }

  try {
    const isUpdated = await DB.jobs.update(jobNumber, {
      status: JobStatus.IN_PROGRESS,
    } as Partial<Job>);
    if (isUpdated === 0) {
      return getBadRequestResponse("Job Not Found");
    }
    return getSuccessResponse({ message: "Job updated successfully" });
  } catch (err: any) {
    return getBadRequestResponse(err);
  }
};

// Get Inspection Notes
export const getInspectionNotesController: RouteHandler = async ({ url }) => {
  const category_id = url.searchParams.get("category_id");

  try {
    if (!category_id) {
      const notes = await DB.inspectionNotes.toArray();
      return getSuccessResponse(notes);
    }

    const notes = await DB.inspectionNotes
      .where({ category_id: Number(category_id) })
      .toArray();
    return getSuccessResponse(notes);
  } catch (err: any) {
    return getBadRequestResponse(err);
  }
};

// Add inspection note to a job
export const addInspectionNoteByJobController: RouteHandler = async ({
  url,
  request,
}) => {
  const jobNumber = url.searchParams.get("jobNumber");
  if (!jobNumber) {
    return getBadRequestResponse();
  }

  const body = await request.json();

  try {
    const currentJob = await DB.jobs.get(jobNumber);
    if (!currentJob) {
      return getBadRequestResponse();
    }

    const isExists = currentJob.inspectionNotes?.find(
      (note) => note === body.note
    );
    if (isExists) {
      return getBadRequestResponse("Note already exists.");
    }
    const added = await DB.jobs
      .where("jobNumber")
      .equals(jobNumber)
      .modify((job) => {
        if (!job.inspectionNotes) {
          job.inspectionNotes = [body.note];
        } else {
          job.inspectionNotes.push(body.note);
        }
      });
    if (added === 0) {
      return getBadRequestResponse();
    }
    return getSuccessResponse({ message: "Note added successfully" });
  } catch (err) {
    return getBadRequestResponse();
  }
};

// Delete Inspection note by job
export const deleteInspectionNoteByJobController: RouteHandler = async ({
  url,
  request,
}) => {
  const jobNumber = url.searchParams.get("jobNumber");
  if (!jobNumber) {
    return getBadRequestResponse();
  }

  const body = await request.json();

  try {
    const deleted = await DB.jobs
      .where("jobNumber")
      .equals(jobNumber)
      .modify((job) => {
        if (job.inspectionNotes && job.inspectionNotes.length !== 0) {
          job.inspectionNotes = job.inspectionNotes.filter(
            (note) => note !== body.note
          );
        }
      });
    if (deleted === 0) {
      return getBadRequestResponse();
    }
    return getSuccessResponse({ message: "Note deleted successfully" });
  } catch (err) {
    return getBadRequestResponse();
  }
};

// Get Library Items Index
export const getLibraryItemIndexController: RouteHandler = async () => {
  try {
    const transaction = await DB.transaction(
      "rw",
      DB.libraryItemCategories,
      DB.libraryItems,
      async () => {
        const categories = await DB.libraryItemCategories
          .orderBy("name")
          .keys();
        const items = await DB.libraryItems.orderBy("[name+category]").keys();
        const libraryItems = items.map((item: any) => ({
          name: item[0],
          category: item[1],
        }));

        return {
          categories,
          libraryItems,
        };
      }
    );

    return getSuccessResponse(transaction);
  } catch (err: any) {
    return getBadRequestResponse(err);
  }
};

export const addInspectionItemsController: RouteHandler = async ({
  url,
  request,
}) => {
  const jobNumber = url.searchParams.get("jobNumber");
  if (!jobNumber) {
    return getBadRequestResponse();
  }

  try {
    const body = await request.json();

    const transaction = await DB.transaction(
      "rw",
      DB.jobs,
      DB.libraryItems,
      DB.inspectionItems,
      async () => {
        const job = await DB.jobs.get(jobNumber);
        if (!job) {
          return null;
        }

        const inspectionItem: InspectionItem = {
          uuid: crypto.randomUUID(),
          job_id: job.id,
          name: body.name,
          images: body.images,
          isCustom: body.isCustom,
          note: body.note,
          isPreviousItem: 0,
        };

        if (body.isCustom) {
          inspectionItem.category = "Custom";
          inspectionItem.openingParagraph = body.openingParagraph;
          inspectionItem.closingParagraph = body.closingParagraph;
          inspectionItem.embeddedImage = body.embeddedImage;
        } else {
          inspectionItem.category = body.category;
          const libIndexitems = await DB.libraryItems
            .where("name")
            .equals(body.name)
            .toArray();
          const item = libIndexitems[0];
          inspectionItem.library_item_id = item.id;
        }

        const added = await DB.inspectionItems.add(inspectionItem);
        if (!added) {
          return null;
        }
        return added;
      }
    );
    if (!transaction) {
      return getBadRequestResponse();
    }
    return getSuccessResponse({ message: "Item added successfully" });
  } catch (err: any) {
    return getBadRequestResponse(err);
  }
};

// Get All items by job number
export const getAllInspectionItemsByJobController: RouteHandler = async ({
  url,
}) => {
  try {
    const uuid = url.searchParams.get("uuid");
    if (uuid) {
      const transaction = await DB.transaction(
        "rw",
        DB.inspectionItems,
        DB.libraryItems,
        async () => {
          const inspectionItem = await DB.inspectionItems.get(uuid);
          if (!inspectionItem) {
            return null;
          }
          if (!inspectionItem.isCustom && inspectionItem.library_item_id) {
            const libraryItem = await DB.libraryItems.get(
              inspectionItem.library_item_id
            );
            if (libraryItem) {
              inspectionItem.openingParagraph = libraryItem.openingParagraph;
              inspectionItem.closingParagraph = libraryItem.closingParagraph;
              inspectionItem.embeddedImage = libraryItem.embeddedImage;
            }
          }
          return inspectionItem;
        }
      );

      if (!transaction) {
        return getBadRequestResponse();
      }
      return getSuccessResponse(transaction);
    }
    const query = url.searchParams;
    const jobNumber = query.get("jobNumber");
    if (!jobNumber) {
      return getBadRequestResponse();
    }

    const page = query.get("page");
    const category = query.get("category");

    const perPage = 15;
    const pageNumber = Number(page);
    const skip = pageNumber === 0 ? 0 : (pageNumber - 1) * perPage;

    const transaction = await DB.transaction(
      "rw",
      DB.jobs,
      DB.inspectionItems,
      async () => {
        const job = await DB.jobs.get(jobNumber);
        if (!job) {
          return null;
        }
        const dbQuery = {
          job_id: job.id,
          isPreviousItem: 0,
          ...(category ? { category } : {}),
        };

        const itemsCollection = DB.inspectionItems.where(dbQuery);
        const total = await itemsCollection.count();
        const totalPages =
          total % perPage === 0
            ? total / perPage
            : Math.floor(total / perPage) + 1;

        const items = await itemsCollection
          .offset(skip)
          .limit(perPage)
          .toArray();
        return {
          items,
          pages: totalPages,
          currentPage: pageNumber === 0 ? 1 : pageNumber,
        };
      }
    );

    if (!transaction) {
      return getBadRequestResponse();
    }
    return getSuccessResponse(transaction);
  } catch (err: any) {
    return getBadRequestResponse();
  }
};

// Delete Inspection item by job
export const deleteInspectionItemController: RouteHandler = async ({ url }) => {
  const uuid = url.searchParams.get("uuid");
  if (!uuid) {
    return getBadRequestResponse();
  }

  try {
    await DB.inspectionItems.delete(uuid);
    return getSuccessResponse({
      message: "Inspection item deleted successfully",
    });
  } catch (err: any) {
    return getBadRequestResponse();
  }
};

// Get Library Items Categories
export const getLibraryItemCategoriesController: RouteHandler = async () => {
  try {
    const categories = await DB.libraryItemCategories.toArray();
    return getSuccessResponse(categories);
  } catch (err) {
    return getBadRequestResponse();
  }
};

// Create new Job
export const newJobController: RouteHandler = async ({ request }) => {
  try {
    const body = await request.json();
    if (!body) {
      return getBadRequestResponse();
    }

    await DB.jobs.add(body);
    return getSuccessResponse({ message: "job added" });
  } catch (err) {
    return getBadRequestResponse();
  }
};

// // Get Library items
// export const getLibraryItemsController: RouteHandler = async ({ url }) => {
//   try {
//     const id = url.searchParams.get("id");
//     if (id) {
//       const item = await Db.libraryItems.get(Number(id));
//       return getSuccessResponse(item);
//     }

//     const category = url.searchParams.get("category");
//     const updated_at = url.searchParams.get("updated_at");
//     const page = url.searchParams.get("page");

//     const perPage = 25;
//     const pageNumber = Number(page);
//     const skip = pageNumber === 0 ? 0 : (pageNumber - 1) * perPage;

//     if (category || updated_at) {
//       const category_id = Number(category);
//       const dbQuery = {
//         ...(category_id && category_id !== 0 ? { category_id } : {}),
//         ...(updated_at ? { updated_at } : {}),
//       };

//       const itemsCollection = Db.libraryItems.where(dbQuery);
//       const total = await itemsCollection.count();
//       const totalPages =
//         total % perPage === 0
//           ? total / perPage
//           : Math.floor(total / perPage) + 1;
//       const items = await itemsCollection.offset(skip).limit(perPage).toArray();
//       return getSuccessResponse({
//         data: items,
//         pages: totalPages,
//         currentPage: pageNumber === 0 ? 1 : pageNumber,
//       });
//     } else {
//       const itemsCollection = Db.libraryItems.orderBy("updated_at").reverse();
//       const total = await itemsCollection.count();
//       const totalPages =
//         total % perPage === 0
//           ? total / perPage
//           : Math.floor(total / perPage) + 1;
//       const items = await itemsCollection.offset(skip).limit(perPage).toArray();
//       return getSuccessResponse({
//         data: items,
//         pages: totalPages,
//         currentPage: pageNumber === 0 ? 1 : pageNumber,
//       });
//     }
//   } catch (err) {
//     return getBadRequestResponse(err);
//   }
// };

// // Create Library items
// export const createLibraryItemsController: RouteHandler = async ({
//   request,
// }) => {
//   try {
//     const body = await request.json();
//     const response = await inspectionApi(
//       "/api/library-items",
//       "POST",
//       JSON.stringify(body)
//     );
//     if (!response.success) {
//       return getBadRequestResponse(response.message);
//     }

//     const itemAdded = await Db.libraryItems.add(response.data.data);
//     if (!itemAdded) {
//       return getBadRequestResponse("Something went wrong");
//     }
//     return getSuccessResponse({ message: "Item created successfully" }, 201);
//   } catch (err) {
//     return getBadRequestResponse(err);
//   }
// };

// // Update Library items
// export const updateLibraryItemsController: RouteHandler = async ({
//   url,
//   request,
// }) => {
//   const id = url.searchParams.get("id");
//   if (!id) {
//     return getBadRequestResponse();
//   }

//   try {
//     const body = await request.json();
//     const response = await inspectionApi(
//       `/api/library-items/${id}`,
//       "PUT",
//       JSON.stringify(body)
//     );
//     if (!response.success) {
//       return getBadRequestResponse(response.message);
//     }

//     const updated = await Db.libraryItems.update(
//       Number(id),
//       response.data.data
//     );
//     if (updated === 0) {
//       return getBadRequestResponse("Something went wrong");
//     }
//     return getSuccessResponse({
//       message: "Item updated successfully",
//     });
//   } catch (err) {
//     return getBadRequestResponse(err);
//   }
// };

// // Delete Library items
// export const deleteLibraryItemController: RouteHandler = async ({ url }) => {
//   const id = url.searchParams.get("id");
//   if (!id) {
//     return getBadRequestResponse();
//   }

//   try {
//     const response = await inspectionApi(`/api/library-items/${id}`, "DELETE");
//     if (!response.success) {
//       return getBadRequestResponse(response.message);
//     }

//     await Db.libraryItems.delete(Number(id));
//     return getSuccessResponse({
//       message: "Item Deleted successfully",
//     });
//   } catch (err) {
//     return getBadRequestResponse(err);
//   }
// };

// // Create inspection notes
// export const createInspectionNotesController: RouteHandler = async ({
//   request,
// }) => {
//   try {
//     const body = await request.json();
//     const response = await inspectionApi(
//       "/api/inspection-notes",
//       "POST",
//       JSON.stringify(body)
//     );
//     if (!response.success) {
//       return getBadRequestResponse(response.message);
//     }

//     const created = await Db.inspectionNotes.add(response.data);
//     if (!created) {
//       return getBadRequestResponse();
//     }
//     return getSuccessResponse({ message: "Note created successfully" }, 201);
//   } catch (err) {
//     return getBadRequestResponse(err);
//   }
// };

// // edit inspection item
// export const editInspectionNotesController: RouteHandler = async ({
//   url,
//   request,
// }) => {
//   const id = url.searchParams.get("id");
//   if (!id) {
//     return getBadRequestResponse();
//   }

//   try {
//     const body = await request.json();

//     const response = await inspectionApi(
//       `/api/inspection-notes/${id}`,
//       "PUT",
//       JSON.stringify(body)
//     );
//     if (!response.success) {
//       return getBadRequestResponse(response.message);
//     }

//     const updated = await Db.inspectionNotes.update(Number(id), response.data);
//     if (updated === 0) {
//       return getBadRequestResponse();
//     }
//     return getSuccessResponse({ message: "Item updated successfully" });
//   } catch (err) {
//     return getBadRequestResponse(err);
//   }
// };

// // Delete inspection notes
// export const deleteInspectionNotesController: RouteHandler = async ({
//   url,
// }) => {
//   const id = url.searchParams.get("id");
//   if (!id) {
//     return getBadRequestResponse();
//   }

//   try {
//     const response = await inspectionApi(
//       `/api/inspection-notes/${id}`,
//       "DELETE"
//     );
//     if (!response.success) {
//       return getBadRequestResponse(response.message);
//     }

//     await Db.inspectionNotes.delete(Number(id));
//     return getSuccessResponse({ message: "Item deleted successfully" });
//   } catch (err) {
//     return getBadRequestResponse(err);
//   }
// };

// export const createJobController: RouteHandler = async ({ request }) => {
//   const body = await request.json();
//   if (!body) {
//     return getBadRequestResponse();
//   }

//   const jobNumber: any = await createNewJob(body);
//   if (jobNumber.error === "DuplicateKey") {
//     return getBadRequestResponse("Job Already Exists.");
//   }
//   if (!jobNumber) {
//     return getBadRequestResponse();
//   }
//   return getSuccessResponse(jobNumber, 201);
// };

// // Get Job / Inspection Summary
// export const getJobInspectionSummaryController: RouteHandler = async ({
//   url,
// }) => {
//   const jobNumber = url.searchParams.get("jobNumber");
//   if (!jobNumber) {
//     return getBadRequestResponse();
//   }

//   try {
//     const trs = await Db.transaction(
//       "rw",
//       Db.jobs,
//       Db.inspectionItems,
//       async () => {
//         const job = await Db.jobs.get(jobNumber);
//         if (!job) {
//           return getBadRequestResponse("No Job Found");
//         }
//         const inspectionItems = await Db.inspectionItems
//           .where("job_id")
//           .equals(job.id)
//           .toArray();
//         return {
//           ...job,
//           inspectionItems,
//         } as Inspection;
//       }
//     );

//     return getSuccessResponse(trs);
//   } catch (err) {
//     return getBadRequestResponse(err);
//   }
// };

// // Get Library index
// export const getLibIndexController = async () => {
//   try {
//     const libs = await Db.libraryIndex.toArray();
//     const categories = await Db.libraryItemCategories.toArray();
//     return getSuccessResponse({
//       items: libs,
//       categories: categories.map((category) => ({
//         text: category.name,
//         value: category.id,
//       })),
//     });
//   } catch (err) {
//     return getBadRequestResponse(err);
//   }
// };

// export const addInspectionNotesController: RouteHandler = async ({
//   url,
//   request,
// }) => {
//   const id = url.searchParams.get("inspectionId");
//   if (!id || id === "") {
//     return getBadRequestResponse();
//   }

//   const body = await request.json();
//   if (!body) {
//     return getBadRequestResponse();
//   }

//   const inspectionId = await addInspectionNotes(
//     body.inspectionNotes,
//     parseInt(id)
//   );
//   if (!inspectionId) {
//     return getBadRequestResponse();
//   }
//   return getSuccessResponse(inspectionId);
// };

// export const addInspectionItemsController: RouteHandler = async ({
//   url,
//   request,
// }) => {
//   const inspectionId = url.searchParams.get("inspectionId");
//   if (!inspectionId || inspectionId === "") {
//     return getBadRequestResponse();
//   }

//   const itemData = await request.formData();
//   if (!itemData) {
//     return getBadRequestResponse();
//   }

//   const inspection = await addInspectionItem(itemData, inspectionId);
//   if (!inspection) {
//     return getBadRequestResponse();
//   }
//   return getSuccessResponse(inspection, 201);
// };

// export const deleteInspectionItemsController: RouteHandler = async ({
//   url,
// }) => {
//   const inspectionId = url.searchParams.get("inspectionId");
//   if (!inspectionId || inspectionId === "") {
//     return getBadRequestResponse();
//   }

//   const itemId = url.searchParams.get("itemId");
//   if (!itemId || itemId === "") {
//     return getBadRequestResponse();
//   }

//   const inspection = await deleteInspectionItem(itemId, inspectionId);
//   if (!inspection) {
//     return getBadRequestResponse();
//   }
//   return getSuccessResponse(inspection);
// };

// export const addRecommendationController: RouteHandler = async ({
//   url,
//   request,
// }) => {
//   const inspectionId = url.searchParams.get("inspectionId");
//   if (!inspectionId || inspectionId === "") {
//     return getBadRequestResponse();
//   }

//   const body = await request.json();
//   if (!body) {
//     return getBadRequestResponse();
//   }
//   const inspection = await addRecommendation(body.recommendation, inspectionId);
//   if (!inspection) {
//     return getBadRequestResponse();
//   }
//   return getSuccessResponse(inspection);
// };

// export const generateReportController: RouteHandler = async ({
//   url,
//   request,
// }) => {
//   const inspectionId = url.searchParams.get("inspectionId");
//   if (!inspectionId || inspectionId === "") {
//     return getBadRequestResponse();
//   }

//   const body = await request.json();
//   if (!body) {
//     return getBadRequestResponse();
//   }

//   const reportData = await getPdf(body.items, inspectionId);
//   if (!reportData) {
//     return getBadRequestResponse();
//   }
//   return getSuccessResponse(reportData);
// };

// export const getLibraryNotesController: RouteHandler = async () => {
//   const libraryNotes = await getLibraryNotes();
//   if (!libraryNotes) {
//     return getBadRequestResponse();
//   }

//   return getSuccessResponse(libraryNotes);
// };
