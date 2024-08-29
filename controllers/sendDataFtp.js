
const axios = require('axios')
const ftp = require("basic-ftp");
const fs = require("fs");
const path = require("path");
const TEMP_DIR = '/tmp/uploads';

async function sendFiles(linkpdf, linkxml, key) {
    let client;
    const localFilePathpdf = path.join(TEMP_DIR, `${key}.pdf`);
    const filenamepdf = `${key}.pdf`;
    const serverFileDirpdf = `/NAVEGANTES_IMP_PDF_Notas`;

    const localFilePathxml = path.join(TEMP_DIR, `${key}-nfe.xml`);
    const filenamexml = `${key}-nfe.xml`;
    const serverFileDirxml = `/FILIAL_importacao_bk`;
    try {
        console.log('Starting FTP connection...');
        client = new ftp.Client();
        client.ftp.verbose = true;
        client.ftp.timeout = 30000;
        client.ftp.keepAliveInterval = 30000;
        client.ftp.usePassiveMode = true;

        await client.access({
            host: process.env.HOSTVENDEMMIAFTP,
            user: process.env.USERVENDEMMIAFTP,
            password: process.env.PASSWORDVENDEMMIAFTP,
            secure: false
        });

        // Processamento do primeiro arquivo
        await downloadFile(linkpdf, localFilePathpdf);
        await client.ensureDir(serverFileDirpdf);
        await client.uploadFrom(localFilePathpdf, filenamepdf);

        const firstFileExists = await checkFileExists(client, serverFileDirpdf, filenamepdf);
        if (!firstFileExists) {
            return { msg: `O arquivo PDF não foi enviado`, status: 500 };
        }

        // Processamento do segundo arquivo
        await downloadFile(linkxml, localFilePathxml);
        await client.ensureDir(serverFileDirxml);
        await client.uploadFrom(localFilePathxml, filenamexml);

        const lastFileExists = await checkFileExists(client, serverFileDirxml, filenamexml);
        if (!lastFileExists) {
            return { msg: `O arquivo XML não foi enviado`, status: 500 };
        }
        return { msg: `Arquivos enviados com sucesso ao servidor FTP`, status: 200 };

    } catch (error) {
        console.error("Erro ao enviar os arquivos:", error.message);
        return { msg: `Erro ao enviar os arquivos`, error: error.message, status: 500 };
    } finally {
        if (client) {
            try {
                client.close();
                console.log("Conexão FTP fechada.");
            } catch (closeError) {
                console.error("Erro ao fechar a conexão FTP:", closeError.message);
                return { msg: `Erro ao fechar a conexão FTP`, error: closeError.message, status: 500 };
            }
        }
        cleanupFile(localFilePathpdf);
        cleanupFile(localFilePathxml);
    }
}


async function downloadFile(fileLink, localFilePath) {
    const dirPath = path.dirname(localFilePath);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    const response = await axios({
        url: fileLink,
        method: "GET",
        responseType: "arraybuffer",
    });
    fs.writeFileSync(localFilePath, response.data);
}


function cleanupFile(localFilePath) {
    if (fs.existsSync(localFilePath)) {
        try {
            fs.unlinkSync(localFilePath);
        } catch (unlinkError) {
            console.error("Erro ao remover o arquivo:", unlinkError.message);
        }
    }
}

async function checkFileExists(client, directory, filename) {
    try {
        const fileList = await client.list(directory); 
        return fileList.some(file => file.name === filename);
    } catch (error) {
        console.error(`Erro ao listar arquivos no diretório ${directory}:`, error.message);
        return false;
    }
}


module.exports = sendFiles