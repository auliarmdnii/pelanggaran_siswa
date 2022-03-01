const res = require("express/lib/response")

let pelanggaranSiswaModel = require("../models/index").pelanggaran_siswa
let detailPelanggaranSiswaModel = require("../models/index").detail_pelanggaran_siswa

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

//untuk handle add data pelanggaran siswa
exports.addData = (request, response) => {
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