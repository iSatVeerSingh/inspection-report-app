const channel = new BroadcastChannel("report-pdf");
channel.addEventListener("message", async (e) => {
  if (e.data.type === "NEW_REPORT_PDF") {
    const jobNumber = e.data.jobNumber;
    const pdf = e.data.pdf;

    if (!jobNumber || !pdf) {
      channel.postMessage({
        type: "PDF_SAVE_DONE",
        success: false,
      });
      return;
    }

    try {
      const pdfArrayBuffer = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(pdf as Blob);
        reader.addEventListener("load", (e) => {
          resolve(e.target?.result);
        });
      });
      const fsRoot = await navigator.storage.getDirectory();
      const pdfFolder = await fsRoot.getDirectoryHandle("reports", {
        create: true,
      });
      const fileHnadle = await pdfFolder.getFileHandle(`${jobNumber}.pdf`, {
        create: true,
      });
      const accessHandle = await fileHnadle.createSyncAccessHandle();
      accessHandle.write(pdfArrayBuffer as ArrayBuffer);
      accessHandle.flush();
      accessHandle.close();
      channel.postMessage({ type: "PDF_SAVE_DONE", success: true });
    } catch (err) {
      channel.postMessage({ type: "PDF_SAVE_DONE", success: true });
    }

    // let success = false;
    // try {

    //   try {
    //     await fsRoot.removeEntry(`${jobNumber}.pdf`);
    //   } catch (err) {}

    //   const fileHandle = await fsRoot.getFileHandle(`${jobNumber}.pdf`, {
    //     create: true,
    //   });
    //   const accessHandle = await fileHandle.createSyncAccessHandle();
    //   accessHandle.write(pdfArrayBuffer as ArrayBuffer);
    //   accessHandle.flush();
    //   accessHandle.close();
    //   success = true;
    // } catch (err) {
    //   console.log(err);
    //   channel.postMessage({
    //     type: "PDF_SAVE_DONE",
    //     success: false,
    //   });
    //   return;
    // } finally {
    //   if (success) {
    //     channel.postMessage({ type: "PDF_SAVE_DONE", success: true });
    //   } else {
    //     channel.postMessage({
    //       type: "PDF_SAVE_DONE",
    //       success: false,
    //     });
    //   }
    // }
  }
});
