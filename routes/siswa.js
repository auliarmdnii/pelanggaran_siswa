const express = require(`express`)
const app = express()

app.use(express.json())

// call siswa controller
let siswaController = require("../controllers/siswaController")

// call middleware
let testMiddleware = require("../middlewares/testMiddleware")
let authorization = require("../middlewares/authorization")

// endpoint get data siswa
app.get("/", [
    testMiddleware.middleware1, testMiddleware.middleware2,
    authorization.authorization
],
    siswaController.getDataSiswa)

// endpoint get data siswa
app.get("/", siswaController.getDataSiswa)

// endpoint add data siswa
app.post("/", siswaController.addDataSiswa)

// endpoint edit siswa
app.put("/:id_siswa", siswaController.editDataSiswa)

// endpoint delete siswa
app.delete("/:id_siswa", siswaController.deleteDataSiswa)

module.exports = app