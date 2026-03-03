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

        const cleanedData = jsonData.map(row => {

            const material = row["Material"] || "";
            const description = row["Material Description"] || "";
            const movement = row["Movement Type"] || "";
            const unit = row["Unit of Entry"] || "";

            const qtyRaw = row["Qty in Un. of Entry"];
            const textRaw = row["Text"];

            const qty = Number(qtyRaw || 0);
            let text = Number(textRaw || 0);

            if (!material || !movement) {
                throw new Error("Material atau Movement kosong ditemukan.");
            }

            if (isNaN(qty)) {
                throw new Error("Qty bukan angka pada material: " + material);
            }

            if (isNaN(text)) {
                throw new Error("Text bukan angka pada material: " + material);
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

        });

        console.log("===== CLEANED DATA =====");
        console.log(cleanedData);

    };

    reader.readAsArrayBuffer(file);
});
