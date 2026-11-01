
const dataAwal = [
    {
        id: 1,
        nama: "Rian Pratama",
        usia: 25,
        lokasi: "Jakarta",
        hobi: "Fotografi, Traveling",
        bio: "Senang mengenal orang baru dan mencari teman yang memiliki minat serupa."
    },
    {
        id: 2,
        nama: "Siti Nurhaliza",
        usia: 23,
        lokasi: "Bandung",
        hobi: "Membaca, Kuliner",
        bio: "Suka membaca dan mencoba tempat kuliner baru."
    }
];

function ambilData(key, dataDefault) {
    try {
        const tersimpan = localStorage.getItem(key);

        if (tersimpan !== null) {
            const data = JSON.parse(tersimpan);

            if (Array.isArray(data)) {
                return data;
            }
        }
    } catch (error) {
        console.error("Gagal membaca data:", error);
    }

    return dataDefault.map(item => ({ ...item }));
}

let daftarPasangan = ambilData("jodohinPasangan", dataAwal);

let daftarMatch = ambilData("jodohinMatch", [
    { id: 1, status: "Saling Menyukai", disukai: false },
    { id: 2, status: "Menunggu Respons", disukai: false }
]);

function simpanData() {
    localStorage.setItem("jodohinPasangan", JSON.stringify(daftarPasangan));
    localStorage.setItem("jodohinMatch", JSON.stringify(daftarMatch));
}

function teksAman(teks) {
    return String(teks ?? "").replace(/[&<>"']/g, karakter => {
        const karakterAman = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return karakterAman[karakter];
    });
}

function cariPasangan(kata = "", lokasi = "") {
    kata = kata.toLowerCase().trim();
    lokasi = lokasi.toLowerCase().trim();

    return daftarPasangan.filter(pasangan => {
        const informasi = (
            pasangan.nama + " " +
            pasangan.hobi + " " +
            pasangan.lokasi
        ).toLowerCase();

        return informasi.includes(kata) &&
            (lokasi === "" || pasangan.lokasi.toLowerCase() === lokasi);
    });
}

function tampilkanNotifikasi(pesan, jenis = "success") {
    const notifikasi = $("#notifikasi");

    if (!notifikasi.length) {
        return;
    }

    notifikasi
        .stop(true, true)
        .removeClass("d-none alert-success alert-danger alert-warning")
        .addClass("alert-" + jenis)
        .text(pesan)
        .hide()
        .fadeIn(250)
        .delay(2000)
        .fadeOut(300, function () {
            $(this).addClass("d-none").show();
        });
}

function tampilkanPasangan(data = daftarPasangan) {
    const wadah = $("#daftarPasangan");

    if (!wadah.length) {
        return;
    }

    if (data.length === 0) {
        wadah.html(`
            <div class="col-12">
                <div class="alert alert-light border text-center">
                    Pasangan tidak ditemukan.
                </div>
            </div>
        `);
    } else {
        const kartu = data.map(pasangan => {
            const match = daftarMatch.find(item => item.id === pasangan.id);
            const sudahDisukai = Boolean(match && match.disukai);

            const inisial = pasangan.nama
                .split(" ")
                .map(kata => kata.charAt(0))
                .slice(0, 2)
                .join("")
                .toUpperCase();

            return `
                <div class="col-12 col-md-6">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body p-4">
                            <div class="profile-avatar rounded-circle bg-danger-subtle text-danger d-flex align-items-center justify-content-center mb-3">
                                ${teksAman(inisial)}
                            </div>

                            <h3 class="h5 fw-bold">
                                ${teksAman(pasangan.nama)}, ${teksAman(pasangan.usia)}
                            </h3>

                            <p class="text-secondary mb-2">
                                📍 ${teksAman(pasangan.lokasi)}
                            </p>

                            <p>Hobi: ${teksAman(pasangan.hobi)}</p>

                            <div class="d-grid gap-2">
                                <a href="detail-profil.html" class="btn btn-outline-danger">
                                    Lihat Detail Profil
                                </a>

                                <button type="button"
                                    class="btn ${sudahDisukai ? "btn-success" : "btn-danger"} tombol-suka"
                                    data-id="${pasangan.id}">
                                    ${sudahDisukai ? "✓ Disukai" : "❤️ Suka"}
                                </button>

                                ${pasangan.id > 2 ? `
                                    <button type="button"
                                        class="btn btn-outline-secondary tombol-hapus"
                                        data-id="${pasangan.id}">
                                        Hapus Profil
                                    </button>
                                ` : ""}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        wadah.html(kartu.join(""));
    }

    $("#jumlahPasangan").text(data.length + " pasangan ditemukan");
}

function tampilkanRiwayatMatch() {
    const tabel = $("#tabelMatch");

    if (!tabel.length) {
        return;
    }

    const baris = daftarMatch.map(match => {
        const pasangan = daftarPasangan.find(item => item.id === match.id);

        if (!pasangan) {
            return "";
        }

        let status = match.status;

        if (match.disukai) {
            status = "Menunggu Respons";
        }

        const warna = status === "Saling Menyukai"
            ? "text-bg-success"
            : "text-bg-warning";

        return `
            <tr>
                <td>${teksAman(pasangan.nama)}</td>
                <td>${teksAman(pasangan.usia)}</td>
                <td>${teksAman(pasangan.lokasi)}</td>
                <td>
                    <span class="badge ${warna}">
                        ${teksAman(status)}
                    </span>
                </td>
            </tr>
        `;
    });

    tabel.html(baris.join(""));
}

const URL_API = "https://dummyjson.com/quotes?limit=6";

function tampilkanLoading() {
    $("#statusInspirasi").html(`
        <div class="alert alert-info d-flex align-items-center gap-2">
            <div class="spinner-border spinner-border-sm" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <span>Sedang mengambil data inspirasi...</span>
        </div>
    `);

    $("#daftarInspirasi").empty();
}

function tampilkanInspirasi(data) {
    $("#statusInspirasi").html(`
        <div class="alert alert-success">
            Berhasil mengambil ${data.length} inspirasi dari API.
        </div>
    `);

    const kartu = data.map(item => `
        <div class="col-12 col-md-6 col-lg-4" data-id="${item.id}">
            <div class="card h-100 border-0 shadow-sm">
                <div class="card-body p-4">
                    <div class="text-danger fs-2 mb-2">“</div>
                    <p class="fw-medium">
                        ${teksAman(item.quote)}
                    </p>
                    <hr>
                    <p class="text-secondary small mb-0">
                        Penulis: ${teksAman(item.author)}
                    </p>
                </div>
            </div>
        </div>
    `);

    $("#daftarInspirasi").html(kartu.join(""));
}

function tampilkanError() {
    $("#statusInspirasi").html(`
        <div class="alert alert-danger">
            <h5 class="alert-heading">Gagal Memuat Data</h5>
            <p class="mb-3">
                Data inspirasi tidak dapat diambil. Periksa koneksi internet
                atau coba beberapa saat lagi.
            </p>
            <button type="button" id="tombolCobaLagi" class="btn btn-danger">
                Coba Lagi
            </button>
        </div>
    `);

    $("#daftarInspirasi").empty();
}

async function muatInspirasi() {
    tampilkanLoading();

    try {
        await new Promise(resolve => setTimeout(resolve, 3000));

        const response = await fetch(URL_API);

        if (!response.ok) {
            throw new Error("Gagal mengambil data inspirasi.");
        }

        const hasil = await response.json();

        if (!hasil.quotes || hasil.quotes.length === 0) {
            throw new Error("Data inspirasi tidak ditemukan.");
        }

        tampilkanInspirasi(hasil.quotes);
    } catch (error) {
        tampilkanError();
    }
}

$(document).ready(function () {
    tampilkanPasangan();
    tampilkanRiwayatMatch();

    $("#tombolFilter").on("click", function () {
        const tombol = $(this);
        const panel = $("#panelFilter");

        panel.stop(true, true).slideToggle(300, function () {
            if (panel.is(":visible")) {
                tombol.text("Sembunyikan Pencarian");
            } else {
                tombol.text("Tampilkan Pencarian");
            }
        });
    });

    $("#inputCari, #filterLokasi").on("input change", function () {
        const kata = $("#inputCari").val() || "";
        const lokasi = $("#filterLokasi").val() || "";

        tampilkanPasangan(cariPasangan(kata, lokasi));
    });

    $("#formPencarian").on("submit", function (event) {
        event.preventDefault();

        const kata = $("#inputCari").val().trim();
        const lokasi = $("#filterLokasi").val() || "";

        if (!kata && !lokasi) {
            tampilkanNotifikasi(
                "Masukkan nama, hobi, atau pilih kota terlebih dahulu.",
                "warning"
            );
            return;
        }

        tampilkanPasangan(cariPasangan(kata, lokasi));
    });

    $("#resetFilter").on("click", function () {
        $("#inputCari").val("");
        $("#filterLokasi").val("");

        tampilkanPasangan();
        tampilkanNotifikasi("Pencarian berhasil direset.");
    });

    $("#daftarPasangan").on("click", ".tombol-suka", function () {
        const id = Number($(this).attr("data-id"));
        const pasangan = daftarPasangan.find(item => item.id === id);

        if (!pasangan) {
            return;
        }

        let match = daftarMatch.find(item => item.id === id);

        if (!match) {
            match = {
                id: id,
                status: "Menunggu Respons",
                disukai: true
            };

            daftarMatch.push(match);
        } else {
            match.disukai = !match.disukai;
        }

        simpanData();

        const kata = $("#inputCari").val() || "";
        const lokasi = $("#filterLokasi").val() || "";

        tampilkanPasangan(cariPasangan(kata, lokasi));
        tampilkanRiwayatMatch();

        tampilkanNotifikasi(
            match.disukai
                ? "Kamu menyukai " + pasangan.nama + "!"
                : "Suka pada " + pasangan.nama + " dibatalkan.",
            match.disukai ? "success" : "warning"
        );
    });

    $("#daftarPasangan").on("click", ".tombol-hapus", function () {
        const id = Number($(this).attr("data-id"));
        const pasangan = daftarPasangan.find(item => item.id === id);

        if (!pasangan) {
            return;
        }

        daftarPasangan = daftarPasangan.filter(item => item.id !== id);
        daftarMatch = daftarMatch.filter(item => item.id !== id);

        simpanData();

        tampilkanPasangan(
            cariPasangan(
                $("#inputCari").val() || "",
                $("#filterLokasi").val() || ""
            )
        );

        tampilkanRiwayatMatch();
        tampilkanNotifikasi("Profil " + pasangan.nama + " berhasil dihapus.");
    });

    $("#formProfil").on("submit", function (event) {
        event.preventDefault();

        const nama = $("#nama").val().trim();
        const usia = Number($("#usia").val());
        const lokasi = $("#lokasi").val().trim();
        const hobi = $("#hobi").val().trim();
        const bio = $("#bio").val().trim();

        if (!nama || !usia || !lokasi || !hobi) {
            tampilkanNotifikasi(
                "Nama, usia, lokasi, dan hobi wajib diisi.",
                "danger"
            );
            return;
        }

        if (!Number.isInteger(usia) || usia < 18 || usia > 100) {
            tampilkanNotifikasi(
                "Usia harus antara 18 sampai 100 tahun.",
                "danger"
            );
            return;
        }

        const profilBaru = {
            id: Date.now(),
            nama,
            usia,
            lokasi,
            hobi,
            bio
        };

        daftarPasangan.push(profilBaru);
        simpanData();

        this.reset();

        tampilkanNotifikasi(
            "Profil berhasil disimpan! Kamu akan diarahkan ke beranda."
        );

        setTimeout(function () {
            window.location.href = "index.html";
        }, 1800);
    });

    if ($("#daftarInspirasi").length) {
        muatInspirasi();
    }

    $("#tombolMuatInspirasi").on("click", function () {
        muatInspirasi();
    });

    $("#statusInspirasi").on("click", "#tombolCobaLagi", function () {
        muatInspirasi();
    });
});
