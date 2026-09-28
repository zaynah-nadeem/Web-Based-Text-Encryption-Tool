const algorithm = document.getElementById("algorithm");
const action = document.getElementById("action");
const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");

const key = document.getElementById("key");
const shift = document.getElementById("shift");
const rails = document.getElementById("rails");

const processBtn = document.getElementById("processBtn");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");

const description = document.getElementById("description");
const status = document.getElementById("status");

const keyField = document.getElementById("keyField");
const keyLabel = document.getElementById("keyLabel");
const shiftField = document.getElementById("shiftField");
const railsField = document.getElementById("railsField");

let rsaKeyPair = null;


const descriptions = {

    caesar:
        "Caesar Cipher shifts each alphabetic character by a fixed number.",

    vigenere:
        "Vigenère Cipher uses a repeating keyword to perform different Caesar shifts.",

    vernam:
        "Vernam Cipher uses XOR between the text bytes and the key bytes.",

    railfence:
        "Rail Fence is a transposition cipher that writes text in a zigzag pattern.",

    columnar:
        "Columnar Transposition rearranges characters into columns using a keyword.",

    aes:
        "AES is a modern symmetric encryption algorithm using AES-GCM.",

    rsa:
        "RSA is an asymmetric encryption algorithm using public and private keys.",

    sha256:
        "SHA-256 creates a one-way 256-bit hash. It is hashing, not encryption."

};


algorithm.addEventListener("change", updateUI);
action.addEventListener("change", updateUI);


function updateUI() {

    const method = algorithm.value;

    description.textContent =
        descriptions[method] ||
        "Select an encryption method to see how it works.";

    shiftField.classList.add("hidden");
    railsField.classList.add("hidden");
    keyField.classList.add("hidden");


    if (method === "caesar") {

        shiftField.classList.remove("hidden");

    }

    else if (
        method === "vigenere" ||
        method === "vernam" ||
        method === "columnar"
    ) {

        keyField.classList.remove("hidden");

        keyLabel.textContent = "Key";

    }

    else if (method === "railfence") {

        railsField.classList.remove("hidden");

    }

    else if (method === "aes") {

        keyField.classList.remove("hidden");

        keyLabel.textContent = "Password";

        key.placeholder = "Enter password";

    }

    else if (method === "rsa") {

        keyField.classList.add("hidden");

    }


    if (action.value === "decrypt") {

        processBtn.textContent = "Decrypt";

    }

    else if (method === "sha256") {

        processBtn.textContent = "Hash";

    }

    else {

        processBtn.textContent = "Encrypt";

    }

}


function validate() {

    if (!algorithm.value) {

        showStatus(
            "Please select an encryption method.",
            true
        );

        return false;

    }


    if (!inputText.value) {

        showStatus(
            "Please enter some text.",
            true
        );

        return false;

    }


    const method = algorithm.value;


    if (
        ["vigenere", "vernam", "columnar"].includes(method)
        && !key.value
    ) {

        showStatus(
            "Please enter a key.",
            true
        );

        return false;

    }


    if (method === "aes" && !key.value) {

        showStatus(
            "Please enter an AES password.",
            true
        );

        return false;

    }


    if (
        method === "rsa" &&
        action.value === "decrypt" &&
        !rsaKeyPair
    ) {

        showStatus(
            "Encrypt something with RSA first.",
            true
        );

        return false;

    }


    return true;

}


function showStatus(message, error = false) {

    status.textContent = message;

    status.style.color =
        error ? "#f87171" : "#60a5fa";

}


function caesar(text, amount) {

    return [...text].map(char => {

        const code = char.charCodeAt(0);


        if (code >= 65 && code <= 90) {

            return String.fromCharCode(
                (code - 65 + amount + 26) % 26 + 65
            );

        }


        if (code >= 97 && code <= 122) {

            return String.fromCharCode(
                (code - 97 + amount + 26) % 26 + 97
            );

        }


        return char;

    }).join("");

}




function vigenere(text, keyword, decrypt = false) {

    keyword =
        keyword
            .toUpperCase()
            .replace(/[^A-Z]/g, "");


    if (!keyword) {

        throw new Error(
            "Vigenère key must contain letters."
        );

    }


    let result = "";

    let keyIndex = 0;


    for (const char of text) {

        const code = char.charCodeAt(0);


        if (
            (code >= 65 && code <= 90) ||
            (code >= 97 && code <= 122)
        ) {

            const base =
                code >= 65 && code <= 90
                    ? 65
                    : 97;


            let k =
                keyword.charCodeAt(
                    keyIndex % keyword.length
                ) - 65;


            if (decrypt) {

                k = -k;

            }


            result += String.fromCharCode(
                (code - base + k + 26) % 26 + base
            );


            keyIndex++;

        }

        else {

            result += char;

        }

    }


    return result;

}


function vernam(text, keyText) {

    if (!keyText) {

        throw new Error(
            "Vernam key is required."
        );

    }


    const textBytes =
        new TextEncoder().encode(text);


    const keyBytes =
        new TextEncoder().encode(keyText);


    const result =
        new Uint8Array(textBytes.length);


    for (let i = 0; i < textBytes.length; i++) {

        result[i] =
            textBytes[i] ^
            keyBytes[i % keyBytes.length];

    }


    return bytesToBase64(result);

}


function vernamDecrypt(encoded, keyText) {

    const data =
        base64ToBytes(encoded);


    const keyBytes =
        new TextEncoder().encode(keyText);


    const result =
        new Uint8Array(data.length);


    for (let i = 0; i < data.length; i++) {

        result[i] =
            data[i] ^
            keyBytes[i % keyBytes.length];

    }


    return new TextDecoder().decode(result);

}



function railFenceEncrypt(text, numberOfRails) {

    numberOfRails =
        Number(numberOfRails);


    if (numberOfRails < 2) {

        throw new Error(
            "Number of rails must be at least 2."
        );

    }


    const rows =
        Array.from(
            { length: numberOfRails },
            () => []
        );


    let row = 0;

    let direction = 1;


    for (const char of text) {

        rows[row].push(char);


        if (row === 0) {

            direction = 1;

        }


        if (row === numberOfRails - 1) {

            direction = -1;

        }


        row += direction;

    }


    return rows.flat().join("");

}


function railFenceDecrypt(cipher, numberOfRails) {

    numberOfRails =
        Number(numberOfRails);


    const pattern = [];

    let row = 0;

    let direction = 1;


    for (let i = 0; i < cipher.length; i++) {

        pattern.push(row);


        if (row === 0) {

            direction = 1;

        }


        if (row === numberOfRails - 1) {

            direction = -1;

        }


        row += direction;

    }


    const counts =
        Array(numberOfRails).fill(0);


    pattern.forEach(r => counts[r]++);


    const rows = [];

    let position = 0;


    for (const count of counts) {

        rows.push(
            cipher
                .slice(position, position + count)
                .split("")
        );


        position += count;

    }


    return pattern
        .map(r => rows[r].shift())
        .join("");

}



function columnarEncrypt(text, keyword) {

    const cleanKey =
        keyword.replace(/\s/g, "");


    if (!cleanKey) {

        throw new Error(
            "Columnar key is required."
        );

    }


    const columns =
        cleanKey.length;


    const rows =
        Math.ceil(text.length / columns);


    const padded =
        text.padEnd(
            rows * columns,
            " "
        );


    const order =
        [...cleanKey]
            .map((char, index) => ({
                char: char.toUpperCase(),
                index
            }))
            .sort(
                (a, b) =>
                    a.char.localeCompare(b.char) ||
                    a.index - b.index
            );


    let result = "";


    for (const item of order) {

        for (let r = 0; r < rows; r++) {

            result +=
                padded[
                    r * columns + item.index
                ];

        }

    }


    return result;

}


function columnarDecrypt(cipher, keyword) {

    const cleanKey =
        keyword.replace(/\s/g, "");


    const columns =
        cleanKey.length;


    const rows =
        cipher.length / columns;


    const order =
        [...cleanKey]
            .map((char, index) => ({
                char: char.toUpperCase(),
                index
            }))
            .sort(
                (a, b) =>
                    a.char.localeCompare(b.char) ||
                    a.index - b.index
            );


    const matrix =
        Array.from(
            { length: rows },
            () => Array(columns)
        );


    let position = 0;


    for (const item of order) {

        for (let r = 0; r < rows; r++) {

            matrix[r][item.index] =
                cipher[position++];

        }

    }


    return matrix
        .flat()
        .join("")
        .trimEnd();

}




function bytesToBase64(bytes) {

    let binary = "";

    bytes.forEach(byte => {

        binary += String.fromCharCode(byte);

    });


    return btoa(binary);

}


function base64ToBytes(base64) {

    const binary =
        atob(base64);


    return Uint8Array.from(
        binary,
        char => char.charCodeAt(0)
    );

}



async function deriveAESKey(password, salt) {

    const passwordKey =
        await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(password),
            "PBKDF2",
            false,
            ["deriveKey"]
        );


    return crypto.subtle.deriveKey(

        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
        },

        passwordKey,

        {
            name: "AES-GCM",
            length: 256
        },

        false,

        ["encrypt", "decrypt"]

    );

}


async function aesEncrypt(text, password) {

    const salt =
        crypto.getRandomValues(
            new Uint8Array(16)
        );


    const iv =
        crypto.getRandomValues(
            new Uint8Array(12)
        );


    const aesKey =
        await deriveAESKey(
            password,
            salt
        );


    const encrypted =
        await crypto.subtle.encrypt(

            {
                name: "AES-GCM",
                iv: iv
            },

            aesKey,

            new TextEncoder().encode(text)

        );


    const combined =
        new Uint8Array(
            salt.length +
            iv.length +
            encrypted.byteLength
        );


    combined.set(salt, 0);

    combined.set(iv, salt.length);

    combined.set(
        new Uint8Array(encrypted),
        salt.length + iv.length
    );


    return bytesToBase64(combined);

}


async function aesDecrypt(encoded, password) {

    const data =
        base64ToBytes(encoded);


    const salt =
        data.slice(0, 16);


    const iv =
        data.slice(16, 28);


    const encrypted =
        data.slice(28);


    const aesKey =
        await deriveAESKey(
            password,
            salt
        );


    const decrypted =
        await crypto.subtle.decrypt(

            {
                name: "AES-GCM",
                iv: iv
            },

            aesKey,

            encrypted

        );


    return new TextDecoder()
        .decode(decrypted);

}



async function rsaEncrypt(text) {

    rsaKeyPair =
        await crypto.subtle.generateKey(

            {
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent:
                    new Uint8Array(
                        [1, 0, 1]
                    ),
                hash: "SHA-256"
            },

            true,

            [
                "encrypt",
                "decrypt"
            ]

        );


    const encrypted =
        await crypto.subtle.encrypt(

            {
                name: "RSA-OAEP"
            },

            rsaKeyPair.publicKey,

            new TextEncoder().encode(text)

        );


    return bytesToBase64(
        new Uint8Array(encrypted)
    );

}


async function rsaDecrypt(encoded) {

    const data =
        base64ToBytes(encoded);


    const decrypted =
        await crypto.subtle.decrypt(

            {
                name: "RSA-OAEP"
            },

            rsaKeyPair.privateKey,

            data

        );


    return new TextDecoder()
        .decode(decrypted);

}



async function sha256(text) {

    const hash =
        await crypto.subtle.digest(

            "SHA-256",

            new TextEncoder().encode(text)

        );


    return Array.from(
        new Uint8Array(hash)
    )
        .map(
            byte =>
                byte
                    .toString(16)
                    .padStart(2, "0")
        )
        .join("");

}



processBtn.addEventListener(
    "click",
    async () => {

        if (!validate()) {

            return;

        }


        const method =
            algorithm.value;


        const decrypt =
            action.value === "decrypt";


        const text =
            inputText.value;


        try {

            processBtn.disabled = true;

            processBtn.textContent =
                "Processing...";


            let result = "";


            if (method === "caesar") {

                result =
                    caesar(
                        text,
                        decrypt
                            ? -Number(shift.value)
                            : Number(shift.value)
                    );

            }


            else if (method === "vigenere") {

                result =
                    vigenere(
                        text,
                        key.value,
                        decrypt
                    );

            }


            else if (method === "vernam") {

                result =
                    decrypt
                        ? vernamDecrypt(
                            text,
                            key.value
                        )
                        : vernam(
                            text,
                            key.value
                        );

            }


            else if (method === "railfence") {

                result =
                    decrypt
                        ? railFenceDecrypt(
                            text,
                            rails.value
                        )
                        : railFenceEncrypt(
                            text,
                            rails.value
                        );

            }


            else if (method === "columnar") {

                result =
                    decrypt
                        ? columnarDecrypt(
                            text,
                            key.value
                        )
                        : columnarEncrypt(
                            text,
                            key.value
                        );

            }


            else if (method === "aes") {

                result =
                    decrypt
                        ? await aesDecrypt(
                            text,
                            key.value
                        )
                        : await aesEncrypt(
                            text,
                            key.value
                        );

            }


            else if (method === "rsa") {

                result =
                    decrypt
                        ? await rsaDecrypt(text)
                        : await rsaEncrypt(text);

            }


            else if (method === "sha256") {

                result =
                    await sha256(text);

            }


            outputText.value =
                result;


            showStatus(
                "Operation completed successfully."
            );

        }


        catch (error) {

            showStatus(
                error.message ||
                "Something went wrong.",
                true
            );

        }


        finally {

            processBtn.disabled = false;

            updateUI();

        }

    }
);




copyBtn.addEventListener(
    "click",
    async () => {

        if (!outputText.value) {

            showStatus(
                "There is no result to copy.",
                true
            );

            return;

        }


        await navigator.clipboard
            .writeText(
                outputText.value
            );


        showStatus(
            "Result copied to clipboard."
        );

    }
);




clearBtn.addEventListener(
    "click",
    () => {

        inputText.value = "";

        outputText.value = "";

        key.value = "";

        status.textContent = "";

    }
);


updateUI();