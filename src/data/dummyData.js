// Dummy Data untuk prototype Rosa Lisca
export const dummyData = {
  // Admin credentials
  admin: {
    email: "admin@rosalisca.com",
    password: "admin123"
  },

  // Projects data
  projects: [
    {
      id: 1,
      name: "Proyek Pembangunan Gedung A",
      status: "Berjalan",
      totalTagihan: 2500000000,
      totalLunas: 1800000000,
      contract: {
        nilaiKontrak: 2500000000,
        uangMuka: 375000000,
        potonganReferensi: 0,
        nilaiAddI: 0,
        tambahanPotonganRetensi: 0
      }
    },
    {
      id: 2,
      name: "Renovasi Kantor Pusat",
      status: "Selesai",
      totalTagihan: 1200000000,
      totalLunas: 1200000000,
      contract: {
        nilaiKontrak: 1200000000,
        uangMuka: 180000000,
        potonganReferensi: 0,
        nilaiAddI: 0,
        tambahanPotonganRetensi: 0
      }
    },
    {
      id: 3,
      name: "Proyek Infrastruktur Jalan",
      status: "Mendatang",
      totalTagihan: 0,
      totalLunas: 0,
      contract: {
        nilaiKontrak: 3000000000,
        uangMuka: 450000000,
        potonganReferensi: 0,
        nilaiAddI: 0,
        tambahanPotonganRetensi: 0
      }
    },
    {
      id: 4,
      name: "Pembangunan Jembatan Layang",
      status: "Berjalan",
      totalTagihan: 5000000000,
      totalLunas: 2000000000,
      contract: {
        nilaiKontrak: 5000000000,
        uangMuka: 750000000,
        potonganReferensi: 50000000,
        nilaiAddI: 200000000,
        tambahanPotonganRetensi: 25000000
      }
    }
  ],

  // Billings data per project
  billings: {
    1: [
      {
        id: 1,
        projectId: 1,
        projectName: "Proyek Pembangunan Gedung A",
        uraian: "Tagihan Termin 1 - Pekerjaan Pondasi",
        tanggalMasukBerkas: "2024-01-15",
        tanggalJatuhTempo: "2024-02-15",
        nilaiTagihan: 500000000,
        potonganUangMuka: 75000000,
        retensi5Persen: 21250000,
        nilaiKwintansi: 425000000,
        dpp: 328750000,
        ppn11Persen: 36162500,
        pph265Persen: 8712500,
        nilaiMasukRekening: 356200000,
        nomorFaktur: "FK001/2024",
        status: "Dibayar",
        tanggalPembayaran: "2024-01-20",
        retensiDibayar: false
      },
      {
        id: 2,
        projectId: 1,
        projectName: "Proyek Pembangunan Gedung A",
        uraian: "Tagihan Termin 2 - Pekerjaan Struktur",
        tanggalMasukBerkas: "2024-03-20",
        tanggalJatuhTempo: "2024-04-20",
        nilaiTagihan: 600000000,
        potonganUangMuka: 90000000,
        retensi5Persen: 25500000,
        nilaiKwintansi: 510000000,
        dpp: 394500000,
        ppn11Persen: 43395000,
        pph265Persen: 10454250,
        nilaiMasukRekening: 427440750,
        nomorFaktur: "FK002/2024",
        status: "Dibayar (Retensi Belum Dibayarkan)",
        tanggalPembayaran: "2024-03-25",
        retensiDibayar: false
      },
      {
        id: 3,
        projectId: 1,
        projectName: "Proyek Pembangunan Gedung A",
        uraian: "Tagihan Termin 3 - Pekerjaan Arsitektur",
        tanggalMasukBerkas: "2024-05-10",
        tanggalJatuhTempo: "2024-06-10",
        nilaiTagihan: 700000000,
        potonganUangMuka: 105000000,
        retensi5Persen: 29750000,
        nilaiKwintansi: 595000000,
        dpp: 460250000,
        ppn11Persen: 50627500,
        pph265Persen: 12196625,
        nilaiMasukRekening: 498680875,
        nomorFaktur: "FK003/2024",
        status: "Belum Dibayar",
        tanggalPembayaran: null,
        retensiDibayar: false
      },
      {
        id: 4,
        projectId: 1,
        projectName: "Proyek Pembangunan Gedung A",
        uraian: "Tagihan Termin 4 - Pekerjaan Finishing",
        tanggalMasukBerkas: "2024-07-15",
        tanggalJatuhTempo: "2024-08-15",
        nilaiTagihan: 400000000,
        potonganUangMuka: 60000000,
        retensi5Persen: 17000000,
        nilaiKwintansi: 340000000,
        dpp: 263000000,
        ppn11Persen: 28930000,
        pph265Persen: 6969500,
        nilaiMasukRekening: 284960500,
        nomorFaktur: "FK004/2024",
        status: "Belum Dibayar",
        tanggalPembayaran: null,
        retensiDibayar: false
      }
    ],
    2: [
      {
        id: 5,
        projectId: 2,
        projectName: "Renovasi Kantor Pusat",
        uraian: "Tagihan Final - Renovasi Lengkap",
        tanggalMasukBerkas: "2024-02-01",
        tanggalJatuhTempo: "2024-03-01",
        nilaiTagihan: 1200000000,
        potonganUangMuka: 180000000,
        retensi5Persen: 51000000,
        nilaiKwintansi: 1020000000,
        dpp: 789000000,
        ppn11Persen: 86790000,
        pph265Persen: 20908500,
        nilaiMasukRekening: 854881500,
        nomorFaktur: "FK005/2024",
        status: "Dibayar",
        tanggalPembayaran: "2024-02-10",
        retensiDibayar: true
      }
    ],
    3: [
      {
        id: 6,
        projectId: 3,
        projectName: "Proyek Infrastruktur Jalan",
        uraian: "Tagihan Mobilisasi",
        tanggalMasukBerkas: "2024-08-01",
        tanggalJatuhTempo: "2024-09-01",
        nilaiTagihan: 300000000,
        potonganUangMuka: 45000000,
        retensi5Persen: 12750000,
        nilaiKwintansi: 255000000,
        dpp: 197250000,
        ppn11Persen: 21697500,
        pph265Persen: 5227125,
        nilaiMasukRekening: 213720375,
        nomorFaktur: "FK006/2024",
        status: "Belum Dibayar",
        tanggalPembayaran: null,
        retensiDibayar: false
      }
    ],
    4: [
      {
        id: 7,
        projectId: 4,
        projectName: "Pembangunan Jembatan Layang",
        uraian: "Tagihan Termin 1 - Survey dan Desain",
        tanggalMasukBerkas: "2024-06-01",
        tanggalJatuhTempo: "2024-07-01",
        nilaiTagihan: 1000000000,
        potonganUangMuka: 150000000,
        retensi5Persen: 42500000,
        nilaiKwintansi: 850000000,
        dpp: 657500000,
        ppn11Persen: 72325000,
        pph265Persen: 17423750,
        nilaiMasukRekening: 712401250,
        nomorFaktur: "FK007/2024",
        status: "Dibayar (Retensi Belum Dibayarkan)",
        tanggalPembayaran: "2024-06-05",
        retensiDibayar: false
      },
      {
        id: 8,
        projectId: 4,
        projectName: "Pembangunan Jembatan Layang",
        uraian: "Tagihan Termin 2 - Pekerjaan Struktur Utama",
        tanggalMasukBerkas: "2024-07-01",
        tanggalJatuhTempo: "2024-08-01",
        nilaiTagihan: 1500000000,
        potonganUangMuka: 225000000,
        retensi5Persen: 63750000,
        nilaiKwintansi: 1275000000,
        dpp: 986250000,
        ppn11Persen: 108487500,
        pph265Persen: 26135625,
        nilaiMasukRekening: 1068601875,
        nomorFaktur: "FK008/2024",
        status: "Belum Dibayar",
        tanggalPembayaran: null,
        retensiDibayar: false
      }
    ]
  },

  // Transactions data per project  
  transactions: {
    1: [
      {
        id: 1,
        tanggal: "2024-01-20",
        jenis: "Pemasukan",
        jumlah: 356200000,
        deskripsi: "Pembayaran Termin 1",
        perusahaan: "PT Client ABC",
        jenisDetail: "Pembayaran Tagihan",
        buktiUrl: "#"
      },
      {
        id: 2,
        tanggal: "2024-01-25",
        jenis: "Pengeluaran",
        jumlah: 150000000,
        deskripsi: "Pembelian Material Pondasi",
        perusahaan: "PT Supplier XYZ",
        jenisDetail: "Operasional",
        buktiUrl: "#"
      },
      {
        id: 3,
        tanggal: "2024-03-25",
        jenis: "Pemasukan",
        jumlah: 427440750,
        deskripsi: "Pembayaran Termin 2",
        perusahaan: "PT Client ABC",
        jenisDetail: "Pembayaran Tagihan",
        buktiUrl: "#"
      },
      {
        id: 4,
        tanggal: "2024-04-05",
        jenis: "Pengeluaran",
        jumlah: 200000000,
        deskripsi: "Upah Pekerja Bulan Maret",
        perusahaan: "Tim Konstruksi",
        jenisDetail: "Gaji & Upah",
        buktiUrl: "#"
      },
      {
        id: 5,
        tanggal: "2024-05-15",
        jenis: "Pemasukan",
        jumlah: 498680875,
        deskripsi: "Pembayaran Termin 3",
        perusahaan: "PT Client ABC",
        jenisDetail: "Pembayaran Tagihan",
        buktiUrl: "#"
      }
    ],
    2: [
      {
        id: 6,
        tanggal: "2024-02-10",
        jenis: "Pemasukan",
        jumlah: 854881500,
        deskripsi: "Pembayaran Final Renovasi",
        perusahaan: "PT Client DEF",
        jenisDetail: "Pembayaran Tagihan",
        buktiUrl: "#"
      },
      {
        id: 7,
        tanggal: "2024-02-15",
        jenis: "Pengeluaran",
        jumlah: 300000000,
        deskripsi: "Material Finishing",
        perusahaan: "PT Material GHI",
        jenisDetail: "Operasional",
        buktiUrl: "#"
      }
    ],
    4: [
      {
        id: 8,
        tanggal: "2024-06-05",
        jenis: "Pemasukan",
        jumlah: 712401250,
        deskripsi: "Pembayaran Termin 1 Jembatan",
        perusahaan: "Dinas PU Kota",
        jenisDetail: "Pembayaran Tagihan",
        buktiUrl: "#"
      },
      {
        id: 9,
        tanggal: "2024-06-10",
        jenis: "Pengeluaran",
        jumlah: 100000000,
        deskripsi: "Survey Lokasi dan Analisis Tanah",
        perusahaan: "PT Konsultan JKL",
        jenisDetail: "Konsultasi",
        buktiUrl: "#"
      }
    ]
  },  // Options for form dropdowns
  jenisTransaksi: ["Pemasukan", "Pengeluaran"],
  jenisTransaksiDetail: [
    "Pembayaran Tagihan",
    "Operasional",
    "Gaji & Upah", 
    "Konsultasi",
    "Transportasi",
    "Material",
    "Peralatan",
    "Lain-lain"
  ],
  statusProyek: ["Berjalan", "Selesai", "Mendatang"],
  
  // Status tagihan options
  statusTagihan: [
    "Belum Dibayar",
    "Dibayar", 
    "Dibayar (Retensi Belum Dibayarkan)"
  ],

  // Status pengajuan kas options
  statusPengajuan: [
    "Pending",
    "Approved", 
    "Rejected"
  ],

  // Cash requests data per project
  cashRequests: {
    1: [
      {
        id: 1,
        projectId: 1,
        projectName: "Proyek Pembangunan Gedung A",
        amount: 100000000,
        description: "Pembelian material bangunan",
        requestedBy: "Manager Proyek",
        requestDate: "2024-01-10",
        status: "Approved",
        approvedBy: "Admin Rosa Lisca",
        approvedDate: "2024-01-12",
        history: [
          {
            id: 1,
            action: "Submitted",
            actionBy: "Manager Proyek",
            actionDate: "2024-01-10T10:00:00Z",
            comments: "Pengajuan kas untuk material bangunan"
          },
          {
            id: 2,
            action: "Approved",
            actionBy: "Admin Rosa Lisca",
            actionDate: "2024-01-12T14:30:00Z",
            comments: "Pengajuan disetujui"
          }
        ]
      }
    ],
    2: [],
    3: [],
    4: [
      {
        id: 2,
        projectId: 4,
        projectName: "Pembangunan Jembatan Layang",
        amount: 250000000,
        description: "Biaya konsultasi struktur",
        requestedBy: "Manager Proyek",
        requestDate: "2024-06-01",
        status: "Pending",
        approvedBy: null,
        approvedDate: null,
        history: [
          {
            id: 1,
            action: "Submitted",
            actionBy: "Manager Proyek",
            actionDate: "2024-06-01T09:00:00Z",
            comments: "Pengajuan kas untuk konsultasi struktur jembatan"
          }
        ]
      }
    ]
  }
};