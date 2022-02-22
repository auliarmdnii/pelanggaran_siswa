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
exports.updateData = (request, response) => {
    
}

//untuk handle delete data pelanggaran siswa
exports.deleteDataPelanggaranSiswa = (request, response) => {
    let idPelanggaran = request.params.id_pelanggaran

    // eksekusi 
    modelPelanggaran.destroy({where :{id_pelanggaran:idPelanggaran}})
    .then(result => {
        return response.json({
            message : `Data has been deleted`
        })
    })
    .catch(error => {
        return response.json({
            message : error.message
        })
    })
}