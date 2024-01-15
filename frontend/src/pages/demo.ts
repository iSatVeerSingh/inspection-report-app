import pdfMake from "pdfmake/build/pdfmake";
import {
  Style,
  TDocumentDefinitions,
  Content,
  PageBreak,
  ContentStack,
  ContentTable,
} from "pdfmake/interfaces";
import pdfFonts from "../utils/pdfFonts";
pdfMake.vfs = pdfFonts;

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

export const demogen = (imgblob: any) => {
  const docDefinition: TDocumentDefinitions = {
    pageSize: "A4",
    compress: true,
    content: [
      {
        image: "myimg.jpg",
        width: 220,
      },
    ],
  };

  pdfMake.vfs.myimg = imgblob;
  // console.log(pdfMake.vfs)

  return new Promise((resolve, _reject) => {
    // pdfMake.createPdf(docDefinition).getDataUrl((result) => {
    //   resolve(result);
    // });
    pdfMake.createPdf(docDefinition).getBlob((result) => {
      resolve(result);
    });
  });
};
