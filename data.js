// Function to generate a random date of birth within a reasonable range
function getRandomDateOfBirth(startYear, endYear) {
    const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1; // Simplistic to avoid complex day-month logic
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Function to calculate age based on date of birth
function calculateAge(dateOfBirth) {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
}

export const getListItems = (length) => {
    const listItems = [];

    // Extend the listItems array to 30 items
    for (let i = listItems.length; i < length; i++) {
        const gender = Math.random() < 0.5 ? "Male" : "Female";
        const dateOfBirth = getRandomDateOfBirth(1970, 2006); // Dates from 1970 to 2006
        const age = calculateAge(dateOfBirth);
        const userNamePrefix = gender === "Male" ? "Nguyen Van " : "Tran Thi ";
        const randomChar = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z

        listItems.push({
            userId: `U${String(i + 1).padStart(3, '0')}`,
            userName: `${userNamePrefix}${randomChar}${i}`, // Simple way to make names somewhat unique
            age: age,
            gender: gender,
            dateOfBirth: dateOfBirth,
        });
    }

    return listItems;
};

export const headers = [
    { text: 'User ID', value: 'userId', width: '100px', sort: '' },
    { text: 'User Name', value: 'userName', sort: '' },
    { text: 'Age', value: 'age', width: '80px', sort: '' },
    { text: 'Gender', value: 'gender', width: '120px', sort: '' },
    { text: 'Date of Birth', value: 'dateOfBirth', width: '150px', sort: '' }
];