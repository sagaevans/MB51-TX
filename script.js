document.getElementById('excelFile').addEventListener('change', function (e) {

    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (event) {

        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        console.log("===== RAW EXCEL DATA =====");
        console.log(jsonData);

        const cleanedData = jsonData
            .filter(row => row["Material"] && row["Movement Type"]) // 🔥 skip baris kosong
            .map(row => {

                const material = row["Material"];
                const description = row["Material Description"] || "";
                const movement = row["Movement Type"];
                const unit = row["Unit of Entry"] || "";

                const qty = Number(row["Qty in Un. of Entry"] || 0);
                let text = Number(row["Text"] || 0);

                if (isNaN(qty)) {
                    console.warn("Qty bukan angka pada material:", material);
                    return null;
                }

                if (isNaN(text)) {
                    console.warn("Text bukan angka pada material:", material);
                    return null;
                }

                // 🔥 TEXT IKUT TANDA QTY
                if (unit === "KG") {
                    text = Math.abs(text) * Math.sign(qty);
                }

                return {
                    material,
                    description,
                    movement,
                    qty,
                    unit,
                    text
                };

            })
            .filter(item => item !== null); // buang null

        console.log("===== CLEANED DATA =====");
        console.log(cleanedData);

    };

    reader.readAsArrayBuffer(file);
});
