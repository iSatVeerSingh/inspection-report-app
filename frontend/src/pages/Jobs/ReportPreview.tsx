import { useEffect, useRef, useState } from "react";
import Card from "../../components/Card";
import PageLayout from "../../layouts/PageLayout";
import { useLocation, useParams } from "react-router-dom";
import ButtonPrimary from "../../components/ButtonPrimary";
import clientApi from "../../api/clientApi";
import { InspectionItem, Job } from "../../types";
import { getItemPargarph } from "../../utils/itemParagraph";
import { DB } from "../../db";
import { generatePdf } from "../../utils/pdf";
import { Box } from "@chakra-ui/react";

const ReportPreview = () => {
  const { jobNumber } = useParams();
  const { state: job }: { state: Job } = useLocation();
  const parentRef = useRef<HTMLDivElement>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const generateReport = async () => {
    const response = await clientApi.get(`/jobs/report?jobNumber=${jobNumber}`);
    const inspectionItems = response.data as InspectionItem[];

    const pageWidth = 595; // in point
    const pageHeight = 842; // in points

    const margins = {
      left: 50,
      top: 60,
      right: 50,
      bottom: 25,
    };

    // in points
    const maxContentWidth = pageWidth - margins.left - margins.right - 20;
    const maxContentHeight = pageHeight - margins.top - margins.bottom;

    const maxWidth = 495 - 20; // in points
    const maxHeightInpx = 1009; // in pixels

    const itemsHeights: any[] = [];

    for (let i = 0; i < inspectionItems.length; i++) {
      const item = inspectionItems[i];

      const itemDiv = document.createElement("div");
      itemDiv.style.width = `${maxContentWidth}pt`;
      itemDiv.style.fontFamily = "'Times New Roman', serif";
      itemDiv.style.fontSize = "11pt";
      itemDiv.style.lineHeight = "1";
      itemDiv.style.paddingTop = "5pt";
      parentRef.current?.appendChild(itemDiv);

      const itemNameParagraph = document.createElement("p");
      itemNameParagraph.style.fontWeight = "bold";
      itemNameParagraph.textContent = `${i + 1}. ${item.name!}`;
      itemDiv.appendChild(itemNameParagraph);

      const openingParagraph = document.createElement("div");
      const openingParagraphData = getItemPargarph(item.openingParagraph!);
      if (typeof openingParagraphData === "string") {
        openingParagraph.textContent = openingParagraphData;
      } else {
        for (let j = 0; j < openingParagraphData.length; j++) {
          const paragraph = openingParagraphData[j];
          const paragraphDiv = document.createElement("p");

          for (let k = 0; k < paragraph.text.length; k++) {
            const spanItem = paragraph.text[k];
            const span = document.createElement("span");
            span.textContent = spanItem.text;

            if (spanItem.bold) {
              span.style.fontWeight = "bold";
            }
            if (spanItem.italics) {
              span.style.fontStyle = "italic";
            }
            if (spanItem.decoration) {
              if (typeof spanItem.decoration === "string") {
                span.style.textDecoration = spanItem.decoration;
              } else {
                span.style.textDecoration = "underline line-through";
              }
            }
            paragraphDiv.appendChild(span);
          }
          openingParagraph.appendChild(paragraphDiv);
        }
      }
      itemDiv.appendChild(openingParagraph);

      if (item.note && item.note !== "") {
        const noteParagraph = document.createElement("p");
        noteParagraph.textContent = `Note :- ${item.note}`;
        itemDiv.appendChild(noteParagraph);
      }

      const imageDiv = document.createElement("div");
      imageDiv.style.display = "flex";
      imageDiv.style.flexWrap = "wrap";
      imageDiv.style.gap = "5pt";

      for (let j = 0; j < item.images!.length; j++) {
        const imageStr = item.images![j] as string;
        const img = document.createElement("img");
        img.src = imageStr;
        img.style.width = "220pt";
        img.style.height = "220pt";
        imageDiv.appendChild(img);
      }
      itemDiv.appendChild(imageDiv);

      const closingParagraph = document.createElement("div");
      const closingParagraphData = getItemPargarph(item.closingParagraph!);
      if (typeof closingParagraphData === "string") {
        closingParagraph.textContent = closingParagraphData;
      } else {
        for (let j = 0; j < closingParagraphData.length; j++) {
          const paragraph = closingParagraphData[j];
          const paragraphDiv = document.createElement("p");

          for (let k = 0; k < paragraph.text.length; k++) {
            const spanItem = paragraph.text[k];
            const span = document.createElement("span");
            span.textContent = spanItem.text;

            if (spanItem.bold) {
              span.style.fontWeight = "bold";
            }
            if (spanItem.italics) {
              span.style.fontStyle = "italic";
            }
            if (spanItem.decoration) {
              if (typeof spanItem.decoration === "string") {
                span.style.textDecoration = spanItem.decoration;
              } else {
                span.style.textDecoration = "underline line-through";
              }
            }
            paragraphDiv.appendChild(span);
          }
          closingParagraph.appendChild(paragraphDiv);
        }
      }
      itemDiv.appendChild(closingParagraph);

      const height = itemDiv.clientHeight;

      itemsHeights.push({
        temp: Date.now().toString(32),
        id: item.id,
        height: Math.ceil(height * 0.75),
      });
    }

    // debugger;
    const final: any[] = [];
    let totalSpace = maxContentHeight;
    for (let i = 0; i < itemsHeights.length; i++) {
      const itemA = itemsHeights[i];

      const isExists = final.find(
        (finalItem: any) => finalItem.temp === itemA.temp
      );
      if (isExists) {
        continue;
      }

      let remainingSpace;
      if (itemA.height > totalSpace) {
        remainingSpace = totalSpace - (itemA.height % totalSpace);
      } else {
        remainingSpace = totalSpace - itemA.height;
      }

      itemA.pageBreak = true;
      final.push(itemA);

      if (i === itemsHeights.length - 1) {
        break;
      }

      let currentItem: any;
      let currentDiff = remainingSpace;
      for (let j = i + 1; j < itemsHeights.length; j++) {
        let itemB = itemsHeights[j];

        if (itemB.height <= remainingSpace) {
          if (remainingSpace - itemB.height < currentDiff) {
            const isItemBExists = final.find(
              (finalItem: any) => finalItem.temp === itemB.temp
            );
            if (!isItemBExists) {
              currentItem = itemB;
              currentDiff = remainingSpace - itemB.height;
            }
          }
        }
      }
      if (currentItem) {
        const isCurrentExists = final.find(
          (finalItem: any) => finalItem.temp === currentItem.temp
        );
        if (!isCurrentExists) {
          final.push(currentItem);
        }
      }
    }
    // let currentAvailableSpace = maxHeightInpx; // in pixels

    // for (let i = 0; i < itemsHeights.length; i++) {
    //   const itemA = itemsHeights[i];
    //   const isExists = final.find(
    //     (finalItem: any) => finalItem.temp === itemA.temp
    //   );
    //   if (isExists !== undefined) {
    //     continue;
    //   }

    //   if (itemA.height <= currentAvailableSpace) {
    //     final.push(itemA);
    //     currentAvailableSpace = currentAvailableSpace - itemA.height;
    //   } else if (itemA.height > maxHeightInpx) {
    //     itemA.pageBreak = true;
    //     final.push(itemA);
    //     currentAvailableSpace = maxHeightInpx - (itemA.height % maxHeightInpx);
    //   } else {
    //     itemA.pageBreak = true;
    //     final.push(itemA);
    //     currentAvailableSpace = maxHeightInpx - itemA.height;
    //   }

    //   if (i === itemsHeights.length - 1) {
    //     break;
    //   }

    //   let remainingAvailableSpace = currentAvailableSpace;

    //   let currentItem: any;
    //   let currentDiff = remainingAvailableSpace;
    //   for (let j = i + 1; j < itemsHeights.length; j++) {
    //     const itemB = itemsHeights[j];
    //     const itemBDiff = remainingAvailableSpace - itemB.height;

    //     if (itemBDiff < currentDiff && itemBDiff >= 0) {
    //       currentItem = itemB;
    //       currentDiff = itemBDiff;
    //     }
    //   }

    //   if (currentItem) {
    //     const isCurrentExists = final.find(
    //       (finalItem: any) => finalItem.temp === currentItem.temp
    //     );
    //     if (!isCurrentExists) {
    //       final.push(currentItem);
    //     }
    //   }

    // for (let i = 0; i < itemsHeights.length; i++) {
    //   let item = itemsHeights[i];
    //   let total = 0;

    //   const isExists = final.find((finalItem: any) => finalItem.id === item.id);

    //   if (isExists) {
    //     continue;
    //   }

    //   if (item.height >= maxHeightInpx) {
    //     item.pageBreak = true;
    //     final.push(item);
    //     total = item.height - maxHeightInpx;
    //   }

    //   for (let j = i; j < itemsHeights.length; j++) {
    //     const current = itemsHeights[j];
    //     if (total + current.height < maxHeightInpx) {
    //       if (i === j) {
    //         current.pageBreak = true;
    //       }
    //       final.push(current);
    //       total += current.height;
    //     }
    //   }
    // }

    const pdfResponse = await clientApi.post(
      `/jobs/generate-report?jobNumber=${jobNumber}`,
      {
        itemsHeights: final,
      }
    );

    const pdfUrl = await generatePdf(
      pdfResponse.data.job,
      pdfResponse.data.items,
      pdfResponse.data.template
    );
    // console.log(pdfUrl)
    setPdfUrl(pdfUrl as string);
  };

  return (
    <PageLayout title="Report Preview">
      <Card>
        <ButtonPrimary onClick={generateReport}>Get Report</ButtonPrimary>
        {pdfUrl ? (
          // <embed src={pdfUrl} type="application/pdf" width="600" height="800" />
          // <iframe src={pdfUrl} loading="lazy" width={600} height={800}></iframe>
          <Box mx="auto" width={"600px"} border={"1px"}>
            <embed
              type="application/pdf"
              src={`${pdfUrl}`}
              width="600"
              height="600"
            />
          </Box>
        ) : (
          <div ref={parentRef}></div>
        )}
      </Card>
    </PageLayout>
  );
};

export default ReportPreview;

// "use client";
// import { Box, Flex, Heading, Text } from "@chakra-ui/react";
// import PageLayout from "../../Layout/PageLayout";
// import { useState, useRef, useEffect } from "react";
// import Loading from "../../components/Loading";
// import ButtonPrimary from "../../components/ButtonPrimary";
// import { useParams } from "react-router-dom";
// import clientApi from "../../services/clientApi";
// import { Inspection } from "../../types";

// const ReportPreview = () => {
//   const parentRef = useRef<HTMLDivElement | null>(null);
//   const [pdfUrl, setPdfUrl] = useState<any>(null);
//   const params = useParams();

//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const getInspection = async () => {
//       const response = await clientApi.get(
//         `/inspections?inspectionId=${params.inspectionId}`
//       );

//       if (response.status !== 200) {
//         setLoading(false);
//         return;
//       }

//       const inspection = response.data as Inspection;

//       const maxwidth = 495 - 20; // in points
//       const maxHeightInpx = 1009; // in pixels

//       const itemsHeights: any[] = [];

//       parentRef.current!.innerHTML = "";

//       for (let i = 0; i < inspection.inspectionItems!.length; i++) {
//         const item = inspection.inspectionItems![i];
//         const itemDiv = document.createElement("div");
//         itemDiv.style.width = `${maxwidth}pt`;
//         itemDiv.style.fontFamily = "'Times New Roman', serif";
//         itemDiv.style.fontSize = "11pt";
//         itemDiv.style.lineHeight = "1.2";
//         itemDiv.style.paddingTop = "5pt";
//         parentRef.current!.appendChild(itemDiv);

//         const itemNameParagraph = document.createElement("p");
//         itemNameParagraph.style.fontWeight = "bold";
//         itemNameParagraph.textContent = item.name;
//         itemDiv.appendChild(itemNameParagraph);

//         const openingParagraph = document.createElement("div");
//         if (typeof item.openingParagraph === "string") {
//           openingParagraph.textContent = item.openingParagraph;
//         } else {
//           for (let j = 0; j < item.openingParagraph.length; j++) {
//             const paragraph = item.openingParagraph[j];
//             const paragraphDiv = document.createElement("p");

//             for (let k = 0; k < paragraph.text.length; k++) {
//               const spanItem = paragraph.text[k];
//               const span = document.createElement("span");
//               span.textContent = spanItem.text;

//               if (spanItem.bold) {
//                 span.style.fontWeight = "bold";
//               }
//               if (spanItem.italics) {
//                 span.style.fontStyle = "italic";
//               }
//               if (spanItem.decoration) {
//                 if (typeof spanItem.decoration === "string") {
//                   span.style.textDecoration = spanItem.decoration;
//                 } else {
//                   span.style.textDecoration = "underline line-through";
//                 }
//               }
//               paragraphDiv.appendChild(span);
//             }
//             openingParagraph.appendChild(paragraphDiv);
//           }
//         }
//         itemDiv.appendChild(openingParagraph);

//         if (item.note && item.note !== "") {
//           const noteParagraph = document.createElement("p");
//           noteParagraph.textContent = `Note :- ${item.note}`;
//           itemDiv.appendChild(noteParagraph);
//         }

//         const imageDiv = document.createElement("div");
//         imageDiv.style.display = "flex";
//         imageDiv.style.flexWrap = "wrap";
//         imageDiv.style.gap = "5pt";

//         for (let j = 0; j < item.images!.length; j++) {
//           const imageStr = item.images![j];
//           const img = document.createElement("img");
//           img.src = imageStr;
//           img.style.width = "220pt";
//           img.style.height = "220pt";
//           imageDiv.appendChild(img);
//         }
//         itemDiv.appendChild(imageDiv);

//         const closingParagraph = document.createElement("div");
//         if (typeof item.closingParagraph === "string") {
//           closingParagraph.textContent = item.closingParagraph;
//         } else {
//           for (let j = 0; j < item.closingParagraph.length; j++) {
//             const paragraph = item.closingParagraph[j];
//             const paragraphDiv = document.createElement("p");

//             for (let k = 0; k < paragraph.text.length; k++) {
//               const spanItem = paragraph.text[k];
//               const span = document.createElement("span");
//               span.textContent = spanItem.text;

//               if (spanItem.bold) {
//                 span.style.fontWeight = "bold";
//               }
//               if (spanItem.italics) {
//                 span.style.fontStyle = "italic";
//               }
//               if (spanItem.decoration) {
//                 if (typeof spanItem.decoration === "string") {
//                   span.style.textDecoration = spanItem.decoration;
//                 } else {
//                   span.style.textDecoration = "underline line-through";
//                 }
//               }
//               paragraphDiv.appendChild(span);
//             }
//             closingParagraph.appendChild(paragraphDiv);
//           }
//         }
//         itemDiv.appendChild(closingParagraph);

//         const height = itemDiv.clientHeight;
//         itemsHeights.push({
//           id: item.id as string,
//           height,
//         });
//       }

//       const final: any[] = [];

//       for (let i = 0; i < itemsHeights.length; i++) {
//         let item = itemsHeights[i];
//         let total = 0;

//         const isExists = final.find(
//           (finalItem: any) => finalItem.id === item.id
//         );

//         if (isExists) {
//           continue;
//         }

//         if (item.height >= maxHeightInpx) {
//           item.pageBreak = true;
//           final.push(item);
//           total = maxHeightInpx - item.height;
//         }

//         for (let j = i; j < itemsHeights.length; j++) {
//           const current = itemsHeights[j];
//           if (total + current.height < maxHeightInpx) {
//             if (i === j) {
//               current.pageBreak = true;
//             }
//             final.push(current);
//             total += current.height;
//           }
//         }
//       }

//       const pdfResponse = await clientApi.post(
//         `/inspections/generate-report?inspectionId=${params.inspectionId}`,
//         {
//           items: final,
//         }
//       );

//       if (pdfResponse.status !== 200) {
//         setLoading(false);
//       }

//       setPdfUrl(pdfResponse.data);
//       setLoading(false);
//     };

//     getInspection();
//   }, []);

//   return (
//     <PageLayout title="Report Preview">
//       {loading ? (
//         <Box h={"500px"} position={"relative"} overflow={"hidden"}>
//           <div
//             ref={parentRef}
//             style={{ position: "absolute", zIndex: "-1" }}
//           ></div>
//           <Flex
//             h={"full"}
//             mx={"auto"}
//             alignItems={"center"}
//             justifyContent={"center"}
//             direction={"column"}
//           >
//             <Box>
//               <Loading />
//             </Box>
//             <Text>Please wait while generating Report PDF</Text>
//           </Flex>
//         </Box>
//       ) : (
//         <Box bg="main-bg" border="stroke" borderRadius={5} p="3">
//           <Box>
//             {pdfUrl && (
//               <Box mx="auto" width={"600px"} border={"1px"}>
//                 <embed
//                   type="application/pdf"
//                   src={pdfUrl}
//                   width="600"
//                   height="600"
//                 />
//               </Box>
//             )}
//           </Box>
//         </Box>
//       )}
//     </PageLayout>
//   );
// };

// export default ReportPreview;
