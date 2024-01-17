import { Button, Input } from "@chakra-ui/react";
import { useRef, useState } from "react";

const Test = () => {
  const [loading, setLoading] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);

  const testJson = async () => {
    setLoading(true);
    divRef.current!.innerHTML = "";
    const btn = document.createElement("a");
    btn.textContent = "Download";
    divRef.current!.appendChild(btn);
    let i = 1;
    while (true) {
      const response = await fetch(`/original${i}.json`);
      if (!response.ok) {
        break;
      }
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
      const jsonStr = JSON.stringify(newJob);
      const file = new Blob([jsonStr], { type: "application/json" });
      const downloadurl = URL.createObjectURL(file);

      (btn.download = `report${i}.json`), (btn.href = downloadurl), btn.click();
      i++;
    }
    setLoading(false);
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
          const resizeurl = ctx.canvas.toDataURL("image/jpeg", 0.8);
          yield resizeurl;
        }
      },
    };
  };

  // const inputref = useRef<HTMLInputElement>(null);
  // const imgref = useRef<HTMLImageElement>(null);

  return (
    <div>
      {/* <Input type="file" multiple ref={inputref} /> */}
      <Button isLoading={loading} onClick={testJson}>
        Test Now
      </Button>
      <div ref={divRef}></div>

      {/* <img src="" alt="" ref={imgref} /> */}
    </div>
  );
};

export default Test;
