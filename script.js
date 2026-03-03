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

        // =========================
        // CLEAN & NORMALIZE DATA
        // =========================

        const cleanedData = jsonData.map(row => {

            const material = row["Material"];
            const description = row["Material Description"];
            const movement = row["Movement Type"];
            const unit = row["Unit of Entry"];

            const qty = Number(row["Qty in Un. of Entry"]);
            let text = Number(row["Text"] || 0);

            // VALIDATION
            if (!material) {
                throw new Error("Material kosong ditemukan.");
            }

            if (!movement) {
                throw new Error("Movement Type kosong ditemukan.");
            }

            if (isNaN(qty)) {
                throw new Error("Qty bukan angka pada material: " + material);
            }

            if (isNaN(text)) {
                throw new Error("Kolom Text harus angka pada material: " + material);
            }

            // 🔥 GLOBAL RULE:
            // Jika unit = KG maka tanda LJR ikut tanda Qty
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
