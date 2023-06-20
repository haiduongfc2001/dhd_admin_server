function generateRandomString(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOQRSTUVWXYZ';
    let result ='';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}

const randomString = generateRandomString(64);
console.log(randomString);