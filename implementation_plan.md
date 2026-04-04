# Refactoring Data Isolation per User (Multi-Tenancy)

Tujuan dari refaktor ini adalah untuk memisahkan semua data di database agar setiap user hanya dapat membuat, melihat, mengupdate, dan menghapus datanya sendiri. Hal ini dilakukan dengan menambahkan parameter filter `userId` pada setiap *Query* yang ada di seluruh *Service*.

## User Review Required

> [!WARNING]
> Karena kita akan menambahkan kolom `userId` yang **Wajib Diisi (Required)** pada tabel `category` dan `reportSummary`, apabila Anda sudah memiliki data kategori/report di database sebelumnya, penambahan (push) schema Prisma ini bisa menyebabkan error karena existing data tidak memiliki `userId`. 
>
> **Pertanyaan (Mohon dijawab saat approval):**
> Apakah saya boleh melakukan *reset database* secara otomatis (menghapus semua data lama), atau Anda ingin agar field `userId` ini dibuat optional terlebih dahulu agar data lama tidak hilang? Jika aplikasi masih tahap pengembangan awal, opsi reset jauh lebih cepat.

## Proposed Changes

---

### Prisma Schema

#### [MODIFY] [schema.prisma](file:///c:/PROJECT/Umkm/umkm-be/prisma/schema.prisma)
- Menambahkan `userId Int` dan relasinya ke table `category`.
- Menambahkan `userId Int` dan relasinya ke table `reportSummary`.
- Memperbarui `@@unique([date, periodType])` di `reportSummary` menjadi `@@unique([userId, date, periodType])`.

---

### Controllers

Seluruh controller akan dimodifikasi agar membaca ID user yang sedang login dari `req.user.id` yang diset oleh `authMiddleware`. Kemudian ID ini diteruskan ke service terkait. Controller yang diubah adalah:

#### [MODIFY] [categoriesController.ts](file:///c:/PROJECT/Umkm/umkm-be/src/controller/categoriesController.ts)
#### [MODIFY] [productController.ts](file:///c:/PROJECT/Umkm/umkm-be/src/controller/productController.ts)
#### [MODIFY] [orderController.ts](file:///c:/PROJECT/Umkm/umkm-be/src/controller/orderController.ts)
#### [MODIFY] [expenditureController.ts](file:///c:/PROJECT/Umkm/umkm-be/src/controller/expenditureController.ts)
#### [MODIFY] [reportController.ts](file:///c:/PROJECT/Umkm/umkm-be/src/controller/reportController.ts)
#### [MODIFY] [stockController.ts](file:///c:/PROJECT/Umkm/umkm-be/src/controller/stockController.ts)

---

### Services

Di dalam service, parameter `userId` akan digunakan dalam query `where`. Untuk mencegah user lain mengakses data melalui manipulasi parameter ID, query pencarian file spesifik (`findById`), `update`, dan `delete` akan menggunakan validasi kepemilikan (`where: { id: id, userId: userId }`).

#### [MODIFY] [categoriesService.ts](file:///c:/PROJECT/Umkm/umkm-be/src/service/categoriesService.ts)
- `getAllCategories`: tambah `where: { userId }`
- function create: inject `data: { ...data, userId }`
- function getById/update/delete: Validasi `userId`.

#### [MODIFY] [productService.ts](file:///c:/PROJECT/Umkm/umkm-be/src/service/productService.ts)
- Sama seperti category, pastikan `userId` ada pada `getAllProducts`, pembuatan produk, update produk, dan penghapusan produk.

#### [MODIFY] [orderService.ts](file:///c:/PROJECT/Umkm/umkm-be/src/service/orderService.ts)
- Controller sudah menyuntikkan `userId` ke `createOrder`. Saya akan memastikan query validasi stok (`tx.product.findUnique`) memastikan produk dibeli dari stok milik penjual/user tersebut saja (`userId: userId`).
- `getAllOrders` & `getOrderById`: Hanya ambil dimana `userId`.

#### [MODIFY] [expenditureService.ts](file:///c:/PROJECT/Umkm/umkm-be/src/service/expenditureService.ts)
- Implementasi relasi `userId` di sisi CRUD expenditure.

#### [MODIFY] [reportService.ts](file:///c:/PROJECT/Umkm/umkm-be/src/service/reportService.ts)
- Fungsi `generateReport` harus dibuat per `userId`. Proses penghitungan aggregate untuk income/expense hanya mengambil transaksi dari `userId` tersebut.
- Penambahan filter `userId` di `getReports`.

#### [MODIFY] [stockService.ts](file:///c:/PROJECT/Umkm/umkm-be/src/service/stockService.ts)
- Menampilkan stok hanya untuk produk (`product: { userId }`).

## Open Questions

1. Bagaimana dengan *Existing Data*? Bolehkah saya melakukan reset/push Prisma dengan paksa jika ada error relasi kosong (yaitu menghapus semua riwayat DB Anda yang lama), atau apakah Anda memiliki backup / butuh mempertahankan data uji coba yang sudah ada?

## Verification Plan

### Automated Tests
1. Menjalankan perintah `npx prisma db push` untuk memperbarui skema database (sekaligus drop/reset data jika disetujui).
2. Mengecek apakah sintaks controller dan services tidak memiliki *typescript error* dengan menjalankan proses build atau ts-node.

### Manual Verification
1. User dapat membuat 2 akun baru yang berbeda.
2. Login menggunakan Akun 1, kemudian membuat kategori atau produk.
3. Login menggunakan Akun 2, memastikan halaman produk menjadi kosong (karena data milik Akun 1).
