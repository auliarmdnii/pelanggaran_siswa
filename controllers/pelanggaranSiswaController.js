const { response } = require("express")

let pelanggaranSiswaModel = require("../models/index").pelanggaran_siswa
let detailPelanggaranSiswaModel = require("../models/index").detail_pelanggaran_siswa
let siswaModel = require("../models/index").siswa
let pelanggaranModel = require("../models/index").pelanggaran

exports.getDataPelanggaranSiswa = async(request, response) => { // variabel async digunakan ketika memakai await
    let data = await pelanggaranSiswaModel.findAll({
        include: ["siswa","user", {
            model: "detail_pelanggaran_siswa",
            as: "detail_pelanggaran",
            include: ["pelanggaran"]
        }]
    })
    return response.json(data)
}

exports.filterPelanggaran = async (request, response) => {
    // filter tanggal awal sama tgl akhir
    let start = request.body.start // tgl awal
    let end = request.body.end // tgl akhir

    /** query = select * from pelanggaran_siswa 
     * where waktu between start and end
     */

    let sequelize = require(`sequelize`)
    let Op = sequelize.Op

    let data = await pelanggaranSiswaModel.findAll({
        include: ["siswa","user", {
            model: "detail_pelanggaran_siswa",
            as: "detail_pelanggaran",
            include: ["pelanggaran"]
        }],
        where: {
            waktu: {[Op.between]: [start, end]}
        }
    })
    return response.json(data)
}

//untuk handle add data pelanggaran siswa
exports.addData = async (request, response) => {
    // proses pengurangan poin dari siswa yg melanggar
    // 1. Mengambil poin dari siswa yg bersangkutan
    let siswa = await siswaModel.findOne({
        where: {id_siswa: request.body.id_siswa}
    })
    let poinSiswa = siswa.poin

    // 2. Mengambil nilai poin dari tiap pelanggarannya
    let detail = request.body.detail_pelanggaran_siswa
    let jumlahPoinPelanggaran = 0
    for (let i = 0; i < detail.length; i++) {
        // ambil poin dari tiap pelanggaran
        let pelanggaran = await pelanggaranModel.findOne({
            where: {id_pelanggaran: detail[i].id_pelanggaran}
        })
        let poinPelanggaran = pelanggaran.poin
        jumlahPoinPelanggaran += poinPelanggaran
    }

    // 3. Poin siswa dikurangi jumlah poin pelanggarannya
    let newPoin = poinSiswa - jumlahPoinPelanggaran

    // 4. Update poin siswa
    await siswaModel.update({poin: newPoin},
        {
            where: {id_siswa: request.body.id_siswa}
        })

    // proses untuk insert ke tabel pelanggaran siswa dan detailnya
    let newData = {
        waktu : request.body.waktu,
        id_siswa : request.body.id_siswa,
        id_user : request.body.id_user
    }

    // insert ke tabel pelanggaran_siswa
    pelanggaranSiswaModel.create(newData)
    .then(result => {
            let detail_pelanggaran_siswa = request.body.detail_pelanggaran_siswa
            //asumsinya adl detail_pelanggaran_siswa bertipe array
            let id = result.id_pelanggaran_siswa
            for (let i = 0; i < detail_pelanggaran_siswa.length; i++) {
                detail_pelanggaran_siswa[i].id_pelanggaran_siswa = id
                
            }

            //insert ke tabel detail_pelanggaran_siswa
            detailPelanggaranSiswaModel.bulkCreate(detail_pelanggaran_siswa) // menggunakan bulk karena bertipe array which is banyak data
            .then(result => {
                return response.json({
                    message : `Data has been inserted`
                })
            })
            .catch(error => {
                return response.json({
                    message: error.message
                })
            })
    })
    .catch(error => {
        return response.json({
            message : error.message
        })
    })
}

//untuk handle edit data pelanggaran siswa
exports.updateData = async (request, response) => {
    let id = request.params.id_pelanggaran_siswa
    
    // define data yg diubah di tabel pelanggaran siswa
    let newData = {
        waktu : request.body.waktu,
        id_siswa : request.body.id_siswa,
        id_user : request.body.id_user
    }

    // eksekusi update tbl pelanggaran_siswa
    pelanggaranSiswaModel.update(
        newData, {where: {id_pelanggaran_siswa: id}}
    )
        .then(async (result) => {
            // ada 2 detail -> 1 detail
            // kita hapus data detail yg lama
            // kita insert data detail terbaru

            // setp 1: hapus semua detail berdasarkan id_pelanggaran_siswa
            await detailPelanggaranSiswaModel.destroy(
                {where: {
                    id_pelanggaran_siswa: request.params.id_pelanggaran_siswa
                } }
            )
            // -------------------------------------------------
            
            // step 2: insert kembali data detail terbaru
            let detail_pelanggaran_siswa = request.body.detail_pelanggaran_siswa
            let id = result.id_pelanggaran_siswa
            for (let i = 0; i < detail_pelanggaran_siswa.length; i++) {
                detail_pelanggaran_siswa[i].id_pelanggaran_siswa = id
                
            }

            //insert ke tabel detail_pelanggaran_siswa
            detailPelanggaranSiswaModel.bulkCreate(detail_pelanggaran_siswa) // menggunakan bulk karena bertipe array which is banyak data
            .then(result => {
                return response.json({
                    message : `Data has been inserted`
                })
            })
            .catch(error => {
                return response.json({
                    message: error.message
                })
            })
        })
        .catch(error => console.log(error))
}

//untuk handle delete data pelanggaran siswa
exports.deleteData = (request, response) => {
    let id = request.params.id_pelanggaran_siswa

    // hapus detail pelanggaran siswa
    detailPelanggaranSiswaModel.destroy({
        where: {
            id_pelanggaran_siswa: id
        }
    })
        .then(result => {
            let id = request.params.id_pelanggaran_siswa

            // hapus data pelanggaran siswa
            pelanggaranSiswaModel.destroy({
                where: {
                    id_pelanggaran_siswa: id
                }
            })
                .then(result => {
                    return response.json({
                        message: `Data pelanggaran siswa berhasil dihapus`
                    })
                })
                .catch(error => {
                    return response.json({
                        message: error.message
                    })
                })
        })
        .catch(error => console.log(error))
}