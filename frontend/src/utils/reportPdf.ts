import pdfMake from "pdfmake/build/pdfmake";
import {
  Style,
  TDocumentDefinitions,
  Content,
  PageBreak,
  ContentStack,
  ContentTable,
} from "pdfmake/interfaces";
import pdfFonts from "./pdfFonts";
import { InspectionItem, Job } from "../types";
import { getItemPargarph } from "./itemParagraph";
(pdfMake as any).vfs = pdfFonts;
pdfMake.fonts = {
  Times: {
    normal: "Times-Normal.ttf",
    bold: "Times-Bold.ttf",
    italics: "Times-Italic.ttf",
    bolditalics: "Times-Bold-Italic.ttf",
  },
  Roboto: {
    normal: "Roboto-Regular.ttf",
    italics: "Roboto-Italic.ttf",
    bold: "Roboto-Medium.ttf",
    bolditalics: "Roboto-MediumItalic.ttf",
  },
};

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const defaultStyle: Style = {
  font: "Times",
  fontSize: 11,
};

export const generatePdf = async (
  job: Job,
  items: InspectionItem[],
  template: any
) => {
  const metaData = getMetaData(job, template);

  const docDefinition: TDocumentDefinitions = {
    defaultStyle,
    compress: true,
    ...metaData,
    content: [
      getTitlePage(job, template),
      getTableOfContents(),
      getClientPropertyDetails(job),
      getReportDetails(job),
      getInspectionNotes(job.inspectionNotes!),
      getReportSummary(job, items.length),
      getPurpose(template),
      getGeneral(template),
      getBuildingDefects(template),
      getItemsTable(items),
      getResponsibility(template),
      getTandC(template),
    ],
    info: {
      title: `${job.jobNumber} - ${job.type} Inspection Report`,
      author: "Correct Inspections",
      subject: `${job.type}`,
      keywords: "Inspection Report, Correct Inspections",
    },
  };

  return new Promise((resolve, _reject) => {
    // pdfMake.createPdf(docDefinition).getDataUrl((result) => {
    //   resolve(result);
    // });
    pdfMake.createPdf(docDefinition).getBlob((result) => {
      resolve(result);
    });
  });
};

const getMetaData = (
  job: Job,
  template: any
): Partial<TDocumentDefinitions> => {
  return {
    pageSize: {
      width: 595,
      height: 842,
    },
    header: (currentPage: number) => {
      return currentPage === 1
        ? undefined
        : {
            table: {
              widths: ["*", "*"],
              body: [
                [
                  {
                    image: template.images.logoImage,
                    marginLeft: 20,
                    marginTop: 5,
                    width: 50,
                  },
                  {
                    text: currentPage.toString(),
                    alignment: "right",
                    marginRight: 40,
                    marginTop: 10,
                  },
                ],
              ],
            },
            layout: "noBorders",
          };
    },
    footer: (currentPage: number) => {
      return currentPage === 1
        ? undefined
        : {
            text: `${job.jobNumber} - ${job.type} Inspection Report`,
            color: "#002060",
            fontSize: 10,
            font: "Roboto",
            marginLeft: 40,
          };
    },
    pageOrientation: "portrait",
    pageMargins: [50, 50, 50, 25],
  };
};

const getTitlePage = (job: Job, template: any): Content => {
  return [
    {
      image: template.images.topImage,
      width: 595,
      absolutePosition: { x: 0, y: 0 },
    },
    {
      image: template.images.bottomImage,
      width: 595,
      height: 225,
      absolutePosition: { x: 0, y: 617 },
    },
    {
      stack: [
        {
          text: [
            {
              text: "Call us on: ",
              bold: true,
            },
            {
              text: "(03) 9434 1120",
              link: "tel:0394341120",
            },
          ],
        },
        {
          text: "admin@correctinspections.com.au",
          link: "mailto:admin@correctinspections.com.au",
          decoration: "underline",
        },
        {
          text: "www.correctinspections.com.au",
          link: "https://www.correctinspections.com.au",
          decoration: "underline",
        },
        {
          text: [
            {
              text: "Postal Address: ",
              bold: true,
            },
            {
              text: "P.O. Box 22\nGreensborough VIC 3088",
            },
          ],
        },
      ],
      color: "#002060",
      absolutePosition: {
        x: 350,
        y: 745,
      },
      alignment: "right",
    },
    {
      image: template.images.logoImage,
      width: 250,
      marginTop: 100,
      alignment: "center",
    },
    {
      text: `${job.type}\nINSPECTION REPORT\n& DEFECTS LIST`,
      alignment: "right",
      fontSize: 33,
      marginBottom: 10,
      marginTop: 50,
      color: "#002060",
    },
    {
      text: job.siteAddress,
      alignment: "right",
      fontSize: 18,
      color: "#404040",
    },
  ];
};

const getTableOfContents = (): Content => {
  return {
    pageBreak: "before",
    toc: {
      title: getMainHeading("Table Of Contents"),
    },
  };
};

const getMainHeading = (heading: string, pageBreak?: PageBreak): Content => {
  return {
    pageBreak: pageBreak,
    stack: [
      {
        canvas: [
          {
            type: "rect",
            x: 0,
            y: 0,
            w: 495,
            h: 20,
            color: "#002060",
          },
        ],
      },
      {
        tocItem: heading.toLowerCase() !== "table of contents",
        text: heading,
        fontSize: 13,
        bold: true,
        lineHeight: 1,
        color: "#ffffff",
        marginTop: -17,
        marginLeft: 5,
      },
    ],
    marginBottom: 10,
  };
};

const getMiniDetails = (property: string, value: string): Content => {
  return {
    table: {
      widths: [130, "*"],
      body: [
        [
          {
            text: property,
            bold: true,
          },
          {
            text: value,
          },
        ],
      ],
    },
    layout: "noBorders",
  };
};

const getClientPropertyDetails = (job: Job): Content => {
  return {
    pageBreak: "before",
    stack: [
      getMainHeading("Client & Property Details"),
      getMiniDetails("Client Names(s):", job.customer.nameOnReport),
      getMiniDetails("Subject Property:", job.siteAddress),
    ],
    marginBottom: 15,
  };
};

const getReportDetails = (job: Job): Content => {
  return {
    stack: [
      getMainHeading("Inspection & Report Details"),
      getMiniDetails("Inspection Date:", getDateString(job.startsAt)),
      getMiniDetails("Inspection Time:", job.startTime),
      getMiniDetails("Stage Of Works:", job.stageOfWorks || "N/A"),
      getMiniDetails("Date of this report:", getDateString()),
    ],
    marginBottom: 15,
  };
};

const getDateString = (str?: any) => {
  const date = str ? new Date(str) : new Date();

  const dateString = `${WEEKDAYS[date.getDay()]} ${date.getDate()}th ${
    MONTHS[date.getMonth()]
  } ${date.getFullYear()}`;

  return dateString;
};

const getInspectionNotes = (notes: string[]): Content => {
  return {
    stack: [
      getMainHeading("Inspection Notes"),
      {
        text: "At the time of this inspection, we note the following:",
      },
      {
        ol: notes,
      },
    ],
    marginBottom: 15,
  };
};

const getReportSummary = (job: Job, itemsLength: number): Content => {
  return {
    stack: [
      getMainHeading("Report Summary"),
      {
        text: [
          {
            text: "Total Items:   ",
            bold: true,
          },
          {
            text: itemsLength,
          },
        ],
      },
      ...(job.recommendation && job.recommendation !== ""
        ? [
            {
              text: "Inspector Recommendations:",
              bold: true,
            },
            {
              text: job.recommendation,
            },
          ]
        : []),
    ],
    marginBottom: 15,
  };
};

const getPurpose = (template: any): Content => {
  return {
    stack: [
      getMainHeading("Report Purpose"),
      {
        text: template.sections["Report Purpose"],
      },
    ],
    marginBottom: 15,
  };
};

const getGeneral = (template: any): Content => {
  return {
    stack: [
      getMainHeading("General"),
      {
        text: template.sections["General"],
      },
    ],
    marginBottom: 15,
  };
};

const getBuildingDefects = (template: any): Content => {
  return {
    stack: [
      getMainHeading("Schedule of Building Defects", "before"),
      {
        text: template.sections["Schedule of Building Defects"],
      },
    ],
    marginBottom: 15,
  };
};

const getItemsTable = (inspectionItems: InspectionItem[]): Content => {
  const body = [];

  for (let i = 0; i < inspectionItems.length; i++) {
    const item = inspectionItems[i];

    const openingParagraph = getItemPargarph(item.openingParagraph!);
    const closingParagraph = getItemPargarph(item.closingParagraph!);

    const reportItem = {
      pageBreak: i !== 0 && item.pageBreak ? "before" : undefined,
      stack: [
        {
          text: item.name,
          bold: true,
        },
        ...((typeof openingParagraph === "string"
          ? [{ text: openingParagraph }]
          : openingParagraph) as unknown as Content[]),
      ],
    };
    if (item.note) {
      (reportItem as ContentStack).stack.push({
        text: `Note:- ${item.note}`,
      });
    }

    (reportItem as ContentStack).stack.push(
      getImages(item.images! as string[])
    );

    (reportItem as ContentStack).stack.push(
      ...((typeof closingParagraph === "string"
        ? [{ text: closingParagraph }]
        : closingParagraph) as unknown as Content[])
    );

    const serial: Content = {
      pageBreak: i !== 0 && item.pageBreak ? "before" : undefined,
      text: `${i + 1}`,
    };

    body.push([serial, reportItem]);
  }

  return {
    table: {
      widths: [20, "*"],
      body: body,
    },
    layout: {
      vLineWidth: function (i: number, node: ContentTable) {
        return i === 0 || i === node.table.widths!.length ? 1 : 0;
      },
      hLineColor: "#002060",
      vLineColor: "#002060",
      paddingTop: function (_i, _node) {
        return 5;
      },
    },
  };
};

const getImages = (itemImages: string[]): Content => {
  const imgStack: Content = [];

  const imgRow: Content = {
    columnGap: 5,
    columns: [],
    marginBottom: 2,
    marginTop: 2,
  };
  for (let i = 0; i < itemImages.length; i++) {
    const img = itemImages[i];

    if (i === itemImages.length - 1 && itemImages.length % 2 !== 0) {
      imgStack.push({
        image: img,
        width: 220,
        height: 200,
        alignment: "center",
        marginBottom: 5,
      });
      break;
    }

    imgRow.columns.push({
      image: img,
      width: 220,
      height: 220,
    });

    if (i % 2 !== 0) {
      imgStack.push({ ...imgRow });
      imgRow.columns = [];
    }
  }

  return imgStack;
};

const getResponsibility = (template: any): Content => {
  const resObj = template.sections["Builder’s Responsibility To Rectify"];

  const stack: Content = {
    stack: [getMainHeading("Builder’s Responsibility To Rectify", "before")],
  };
  for (const key in resObj) {
    stack.stack.push({
      stack: [
        {
          text: key,
          bold: true,
        },
        {
          text: resObj[key],
        },
      ],
      marginBottom: 3,
    });
  }

  return stack;
};

const getTandC = (template: any): Content => {
  return {
    stack: [
      getMainHeading(
        "Terms & Conditions for the Provision of this Report",
        "before"
      ),
      {
        ol: template.sections[
          "Terms & Conditions for the Provision of this Report"
        ],
        fontSize: 11,
      },
    ],
  };
};
