import { Button, Input } from "@chakra-ui/react";
import { useRef } from "react";

const Test = () => {
  const testJson = async () => {
    const response = await fetch("/reports1.json");
    const data = await response.json();
    const inspectionItems = data.inspectionItems;

    const newItems = [];
    for await (let dmo of loopitem(inspectionItems)) {
      newItems.push(dmo);
    }

    const newJob = {
      ...data,
      inspectionItems: newItems,
    };

    console.log(newJob);
  };

  async function* loopitem(items: any[]) {
    for (let item of items) {
      let newimgs = [];
      for await (let imgblob of loopimg(item.itemImages)) {
        newimgs.push(imgblob);
      }

      yield {
        ...item,
        itemImages: newimgs,
      };
    }
  }

  const loopimg = (images: string[]) => {
    return {
      [Symbol.asyncIterator]: async function* () {
        for (let img of images) {
          const response = await fetch(img);
          const blob = await response.blob();
          const bitmap = await createImageBitmap(blob);
          const maxwidth = 300;
          const scaleSize = maxwidth / bitmap.width;
          const maxheight = bitmap.height * scaleSize;
          const canvas = document.createElement("canvas");
          canvas.width = maxwidth;
          canvas.height = maxheight;

          const ctx = canvas.getContext("2d")!;
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
          // const resizedBlob = await new Promise((resolve) => {
          //   ctx.canvas.toBlob(
          //     (blob) => {
          //       resolve(blob);
          //     },
          //     "image/jpeg",
          //     0.9
          //   );
          // });
          // yield resizedBlob;
          const resizeurl = ctx.canvas.toDataURL("image/jpeg", 0.8);
          yield resizeurl;
        }
      },
    };
  };

  // async function* loopitems(items: any[]) {
  //   for (let item of items) {
  //     // yield item.itemImages
  //     yield [...loopimages(item.itemImages)];
  //   }
  // }

  // async function* loopimages(images: []) {
  //   for (let image of images) {
  //     yield image;
  //   }
  // }

  const newResize = async (images: any[]) => {
    const bitPromises = [];

    for (let i = 0; i < images.length; i++) {
      const bitmap = await createImageBitmap(images[i]);
      const maxwidth = 300;
      const scaleSize = maxwidth / bitmap.width;
      const maxheight = bitmap.height * scaleSize;
      const canvas = document.createElement("canvas");
      canvas.width = maxwidth;
      canvas.height = maxheight;

      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitPromises.push(
        new Promise((resolve) => {
          ctx.canvas.toBlob(
            (blob) => {
              resolve(blob);
            },
            "image/jpeg",
            0.9
          );
        })
      );
    }

    const newImgs = await Promise.all(bitPromises);
    return newImgs;
  };

  const getResizedImagesBase64Main = async (
    imageFiles: File[]
  ): Promise<string[]> => {
    const resizedImages: any[] = [];
    const base64Promises = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const bitmap = await createImageBitmap(imageFiles[i]);
      if (bitmap.width > 300 || bitmap.height > 300) {
        const maxwidth = 200;
        const scaleSize = maxwidth / bitmap.width;
        const maxheight = bitmap.height * scaleSize;

        const canvas = document.createElement("canvas");
        canvas.width = maxwidth;
        canvas.height = maxheight;

        const ctx = canvas.getContext("2d")!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

        ctx.canvas.toBlob(
          (blob) => {
            console.log(blob);
            resizedImages.push(blob);
          },
          "image/jpeg",
          1
        );
        const base64Str = ctx.canvas.toDataURL("image/jpeg", 0.9);
        resizedImages.push(base64Str);
      } else {
        base64Promises.push(getBase64String(imageFiles[i]));
      }
    }

    return [...resizedImages, ...(await Promise.all(base64Promises))];
  };

  const getBase64String = async (imgBlob: Blob | File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(imgBlob);
      reader.addEventListener("load", (e) => {
        resolve(e.target?.result as string);
      });
    });
  };

  const inputref = useRef<HTMLInputElement>(null);
  const imgref = useRef<HTMLImageElement>(null);

  const testImg = async () => {
    const files = inputref.current?.files;
    if (files?.length === 0) {
      return;
    }

    const resizedImgs = await newResize(files);
    console.log(resizedImgs);
    const imgSrc = URL.createObjectURL(resizedImgs[0] as Blob);
    imgref.current!.src = imgSrc;
    // const resizedImgs = await getResizedImagesBase64Main(
    //   files as unknown as File[]
    // );
    // console.log(resizedImgs)
  };

  return (
    <div>
      <Input type="file" multiple ref={inputref} />
      <Button onClick={testJson}>Test Now</Button>
      <img src="" alt="" ref={imgref} />
    </div>
  );
};

export default Test;
