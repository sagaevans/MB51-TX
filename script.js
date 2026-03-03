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

        console.log("===== RAW DATA =====");
        console.log(jsonData);

        const cleanedData = jsonData.map(row => {

            // Ambil kolom sesuai header Excel kamu
            const material = row["Material"];
            const description = row["Material Description"];
            const movement = row["Movement"];
            const unit = row["Unit of Entry"];

            // --- NORMALISASI QTY ---
            let qtyRaw = row["Qty in Un."].toString();
            qtyRaw = qtyRaw.replace(/\./g, "").replace(",", ".");
            const qty = parseFloat(qtyRaw);

            // --- NORMALISASI TEXT (LJR) ---
            let textRaw = row["Text"].toString().trim();

            if (textRaw === "") textRaw = "0";

            if (isNaN(textRaw)) {
                alert("Error: Kolom Text harus angka saja.");
                throw new Error("Invalid Text Value");
            }

            let text = parseFloat(textRaw);

            // 🔥 FIX: Ikuti tanda dari Qty
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
