
const URL_PROFIL = "http://localhost:3000/profil";

let daftarPasangan = [];

function ambilData(key, dataDefault = []) {
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

    return dataDefault;
}

let daftarMatch = ambilData("jodohinMatch", [
    { id: 1, status: "Saling Menyukai", disukai: false },
    { id: 2, status: "Menunggu Respons", disukai: false }
]);

function simpanData() {
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

function tampilkanNotifikasi(pesan, jenis = "success") {
    const notifikasi = $("#notifikasi");

    if (!notifikasi.length) {
        alert(pesan);
        return;
    }

    notifikasi
        .stop(true, true)
        .removeClass("d-none alert-success alert-danger alert-warning")
        .addClass("alert-" + jenis)
        .text(pesan)
        .hide()
        .fadeIn(250)
        .delay(2500)
        .fadeOut(300, function () {
            $(this).addClass("d-none").show();
        });
}

async function requestProfil(url = URL_PROFIL, options = {}) {
    const response = await fetch(url, options);

    let hasil = {};

    try {
        hasil = await response.json();
    } catch (error) {
        hasil = {};
    }

    if (!response.ok) {
        const pesan = Array.isArray(hasil.message)
            ? hasil.message.join(", ")
            : hasil.message || "Terjadi kesalahan pada server.";

        throw new Error(pesan);
    }

    return hasil;
}

async function muatProfil() {
    try {
        daftarPasangan = await requestProfil();

        tampilkanPasangan();
        tampilkanRiwayatMatch();

        if (window.location.pathname.endsWith("detail-profil.html")) {
            tampilkanDetailProfil();
        }
    } catch (error) {
        console.error(error);
        tampilkanNotifikasi(
            "Gagal mengambil data profil: " + error.message,
            "danger"
        );
    }
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
                                <a href="detail-profil.html?id=${pasangan.id}"
                                    class="btn btn-outline-danger">
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

function tampilkanDetailProfil() {
    const id = Number(new URLSearchParams(window.location.search).get("id")) || 1;
    const pasangan = daftarPasangan.find(item => item.id === id);
    const wadah = $(".card-body").first();

    if (!wadah.length) {
        return;
    }

    if (!pasangan) {
        wadah.html(`
            <div class="alert alert-danger">
                Profil tidak ditemukan.
            </div>
            <a href="index.html" class="btn btn-danger">
                Kembali ke Beranda
            </a>
        `);
        return;
    }

    const inisial = pasangan.nama
        .split(" ")
        .map(kata => kata.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const daftarHobi = pasangan.hobi.split(",").map(hobi => `
        <span class="badge rounded-pill text-bg-light border">
            ${teksAman(hobi.trim())}
        </span>
    `).join("");

    wadah.html(`
        <div class="rounded-circle bg-danger-subtle text-danger d-flex
            align-items-center justify-content-center mx-auto mb-3 profile-avatar">
            ${teksAman(inisial)}
        </div>

        <span class="badge text-bg-danger mb-3">Profil Anggota</span>

        <h1 class="h3 fw-bold">${teksAman(pasangan.nama)}</h1>

        <p class="text-secondary">
            ${teksAman(pasangan.usia)} tahun · ${teksAman(pasangan.lokasi)}
        </p>

        <hr>

        <div class="text-start">
            <h2 class="h5 fw-bold">Tentang Saya</h2>
            <p>${teksAman(pasangan.bio)}</p>

            <h2 class="h5 fw-bold mt-4">Hobi dan Minat</h2>
            <div class="d-flex flex-wrap gap-2">
                ${daftarHobi}
            </div>
        </div>

        <div class="d-grid gap-2 d-sm-flex justify-content-center mt-4">
            <button type="button" id="tombolEditProfil"
                class="btn btn-danger">
                Edit Profil
            </button>

            <a href="index.html" class="btn btn-outline-danger">
                Kembali ke Beranda
            </a>
        </div>

        <form id="formEditProfil" class="text-start mt-4 d-none">
            <hr>
            <h2 class="h5 fw-bold mb-3">Edit Profil</h2>

            <div class="mb-3">
                <label class="form-label">Nama Lengkap</label>
                <input type="text" class="form-control" id="editNama"
                    value="${teksAman(pasangan.nama)}" required>
            </div>

            <div class="mb-3">
                <label class="form-label">Usia</label>
                <input type="number" class="form-control" id="editUsia"
                    min="18" max="100" value="${pasangan.usia}" required>
            </div>

            <div class="mb-3">
                <label class="form-label">Lokasi</label>
                <input type="text" class="form-control" id="editLokasi"
                    value="${teksAman(pasangan.lokasi)}" required>
            </div>

            <div class="mb-3">
                <label class="form-label">Hobi dan Minat</label>
                <textarea class="form-control" id="editHobi"
                    required>${teksAman(pasangan.hobi)}</textarea>
            </div>

            <div class="mb-3">
                <label class="form-label">Tentang Saya</label>
                <textarea class="form-control" id="editBio"
                    minlength="10" maxlength="300" required>${teksAman(pasangan.bio)}</textarea>
            </div>

            <div class="d-grid gap-2 d-sm-flex">
                <button type="submit" class="btn btn-danger">
                    Simpan Perubahan
                </button>

                <button type="button" id="tombolBatalEdit"
                    class="btn btn-outline-secondary">
                    Batal
                </button>
            </div>
        </form>
    `);
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
                    <p class="fw-medium">${teksAman(item.quote)}</p>
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
    muatProfil();

    $("#tombolFilter").on("click", function () {
        const tombol = $(this);
        const panel = $("#panelFilter");

        panel.stop(true, true).slideToggle(300, function () {
            tombol.text(
                panel.is(":visible")
                    ? "Sembunyikan Pencarian"
                    : "Tampilkan Pencarian"
            );
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

        tampilkanPasangan(
            cariPasangan(
                $("#inputCari").val() || "",
                $("#filterLokasi").val() || ""
            )
        );

        tampilkanRiwayatMatch();

        tampilkanNotifikasi(
            match.disukai
                ? "Kamu menyukai " + pasangan.nama + "!"
                : "Suka pada " + pasangan.nama + " dibatalkan.",
            match.disukai ? "success" : "warning"
        );
    });

    $("#daftarPasangan").on("click", ".tombol-hapus", async function () {
        const id = Number($(this).attr("data-id"));
        const pasangan = daftarPasangan.find(item => item.id === id);

        if (!pasangan) {
            return;
        }

        if (!confirm("Yakin ingin menghapus profil " + pasangan.nama + "?")) {
            return;
        }

        try {
            await requestProfil(URL_PROFIL + "/" + id, {
                method: "DELETE"
            });

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

            tampilkanNotifikasi(
                "Profil " + pasangan.nama + " berhasil dihapus."
            );
        } catch (error) {
            tampilkanNotifikasi(error.message, "danger");
        }
    });

    $("#formProfil").on("submit", async function (event) {
        event.preventDefault();

        const nama = $("#nama").val().trim();
        const usia = Number($("#usia").val());
        const lokasi = $("#lokasi").val().trim();
        const hobi = $("#hobi").val().trim();
        const bio = $("#bio").val().trim();

        if (!nama || !usia || !lokasi || !hobi || !bio) {
            tampilkanNotifikasi(
                "Semua data profil wajib diisi.",
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

        if (bio.length < 10 || bio.length > 300) {
            tampilkanNotifikasi(
                "Tentang saya harus berisi 10 sampai 300 karakter.",
                "danger"
            );
            return;
        }

        try {
            await requestProfil(URL_PROFIL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nama,
                    usia,
                    lokasi,
                    hobi,
                    bio
                })
            });

            this.reset();

            tampilkanNotifikasi(
                "Profil berhasil disimpan! Kamu akan diarahkan ke beranda."
            );

            setTimeout(function () {
                window.location.href = "index.html";
            }, 1500);
        } catch (error) {
            tampilkanNotifikasi(error.message, "danger");
        }
    });

    $(document).on("click", "#tombolEditProfil", function () {
        $("#formEditProfil").removeClass("d-none");
    });

    $(document).on("click", "#tombolBatalEdit", function () {
        $("#formEditProfil").addClass("d-none");
    });

    $(document).on("submit", "#formEditProfil", async function (event) {
        event.preventDefault();

        const id = Number(new URLSearchParams(window.location.search).get("id")) || 1;

        const nama = $("#editNama").val().trim();
        const usia = Number($("#editUsia").val());
        const lokasi = $("#editLokasi").val().trim();
        const hobi = $("#editHobi").val().trim();
        const bio = $("#editBio").val().trim();

        if (!nama || !usia || !lokasi || !hobi || !bio) {
            tampilkanNotifikasi(
                "Semua data profil wajib diisi.",
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

        if (bio.length < 10 || bio.length > 300) {
            tampilkanNotifikasi(
                "Tentang saya harus berisi 10 sampai 300 karakter.",
                "danger"
            );
            return;
        }

        try {
            await requestProfil(URL_PROFIL + "/" + id, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nama,
                    usia,
                    lokasi,
                    hobi,
                    bio
                })
            });

            tampilkanNotifikasi("Profil berhasil diperbarui.");

            await muatProfil();
        } catch (error) {
            tampilkanNotifikasi(error.message, "danger");
        }
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
