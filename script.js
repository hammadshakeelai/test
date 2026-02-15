document.addEventListener("DOMContentLoaded", () => {
    loadHistory();
    addRow(); // Start with one row
});

// --- PRESETS ---

// Inside script.js

const presets = {
    // --- BSAI (Artificial Intelligence) ---
    "bsai_1": [
        { name: "Functional English", credit: 3 },
        { name: "Programming Fund. (Th)", credit: 3 },
        { name: "Programming Fund. (Lab)", credit: 1 },
        { name: "ICT (Theory)", credit: 3 },
        { name: "ICT (Lab)", credit: 1 },
        { name: "Islamiat", credit: 2 },
        { name: "Calculus", credit: 3 }
    ],
    "bsai_2": [
        { name: "OOP (Theory)", credit: 3 },
        { name: "OOP (Lab)", credit: 1 },
        { name: "Applied Physics", credit: 3 },
        { name: "Ideology & Const. of Pak", credit: 2 },
        { name: "Expository Writing", credit: 3 },
        { name: "Linear Algebra", credit: 3 },
        { name: "Intro to Business", credit: 2 }
    ],
    "bsai_3": [
        { name: "Civics & Comm. Engage", credit: 2 },
        { name: "Data Structures (Th)", credit: 3 },
        { name: "Data Structures (Lab)", credit: 1 },
        { name: "Digital Logic Design (Th)", credit: 2 },
        { name: "Digital Logic Design (Lab)", credit: 1 },
        { name: "Discrete Structures", credit: 3 },
        { name: "Multivariable Calculus", credit: 3 },
        { name: "Operating Systems (Th)", credit: 2 },
        { name: "Operating Systems (Lab)", credit: 1 }
    ],
    // --- NEW: BSAI Semester 4 ---
    "bsai_4": [
        { name: "Database Systems (Th)", credit: 3 },
        { name: "Database Systems (Lab)", credit: 1 },
        { name: "Software Engineering", credit: 3 },
        { name: "Design & Analysis of Alg. (Th)", credit: 3 },
        { name: "Artificial Intelligence (Th)", credit: 2 },
        { name: "Artificial Intelligence (Lab)", credit: 1 },
        { name: "Comp. Org. & Assembly (Th)", credit: 2 },
        { name: "Comp. Org. & Assembly (Lab)", credit: 1 },
        { name: "Probability & Statistics", credit: 3 }
    ],

    // --- BSCS (Computer Science) ---
    "cs_1": [
        { name: "Intro to ICT", credit: 3 },
        { name: "Prog. Fundamentals", credit: 4 },
        { name: "English Comp", credit: 3 },
        { name: "Calculus", credit: 3 }
    ],
    "cs_2": [
        { name: "OOP", credit: 4 },
        { name: "Discrete Struct", credit: 3 },
        { name: "Comm Skills", credit: 3 },
        { name: "Digital Logic", credit: 3 }
    ],

    // --- BBA ---
    "bba_1": [
        { name: "Microeconomics", credit: 3 },
        { name: "Business Math", credit: 3 },
        { name: "Intro to Business", credit: 3 }
    ]
};

// --- LOGIC: TABS ---
function openTab(evt, tabName) {
    document.querySelectorAll(".tab-content").forEach(tab => tab.style.display = "none");
    document.querySelectorAll(".tab-link").forEach(btn => btn.classList.remove("active"));
    document.getElementById(tabName).style.display = "block";
    if(evt) evt.currentTarget.classList.add("active");
}

function toggleCustomSettings() {
    let model = document.getElementById("gradingModel").value;
    let customBox = document.getElementById("customSettings");
    if (model === "custom") customBox.classList.remove("hidden");
    else customBox.classList.add("hidden");
}

// --- LOGIC: GRADING ---
function getGradeAndGPA(marks, model) {
    marks = parseFloat(marks);
    if (model === "custom") {
        let minA = parseFloat(document.getElementById("customA").value) || 85;
        let passing = parseFloat(document.getElementById("customPass").value) || 50;
        if (marks >= minA) return ["A", 4.0];
        if (marks < passing) return ["F", 0.0];
        if (marks >= passing) return ["P", 2.0];
    } 
    if (model === "strict") {
        if (marks >= 95) return ["A+", 4.0];
        if (marks >= 90) return ["A", 4.0];
        if (marks >= 85) return ["B+", 3.5];
        if (marks >= 80) return ["B", 3.0];
        return ["F", 0.0];
    } 
    else {
        if (marks >= 91) return ["A+", 4.0];
        else if (marks >= 87) return ["A", 4.0];
        else if (marks >= 80) return ["B+", 3.5];
        else if (marks >= 72) return ["B", 3.0];
        else if (marks >= 66) return ["C+", 2.5];
        else if (marks >= 60) return ["C", 2.0];
        else return ["F", 0.0];
    }
}

// --- LOGIC: TABLE ---
function addRow(name = "", credit = "", marks = "") {
    let tbody = document.getElementById("courseTable").getElementsByTagName('tbody')[0];
    let row = tbody.insertRow();
    row.innerHTML = `
        <td><input type="text" placeholder="Subject" value="${name}"></td>
        <td><input type="number" placeholder="Cr" min="1" max="6" value="${credit}"></td>
        <td><input type="number" placeholder="%" min="0" max="100" value="${marks}" oninput="autoCalc(this)"></td>
        <td class="grd">-</td>
        <td class="gpa">-</td>
        <td><button class="delete-btn" onclick="deleteRow(this)"><i class="fas fa-trash"></i></button></td>
    `;
}

function deleteRow(btn) {
    let row = btn.parentNode.parentNode;
    row.parentNode.removeChild(row);
}

function resetTable() {
    document.querySelector("#courseTable tbody").innerHTML = "";
    document.getElementById("sgpa-result").innerHTML = "";
    addRow();
}

function loadPreset() {
    let key = document.getElementById("presetSelect").value;
    if (key && presets[key]) {
        document.querySelector("#courseTable tbody").innerHTML = "";
        presets[key].forEach(sub => addRow(sub.name, sub.credit, ""));
    }
}

function autoCalc(input) {
    let row = input.parentNode.parentNode;
    let marks = input.value;
    let model = document.getElementById("gradingModel").value;
    if(marks) {
        let [g, p] = getGradeAndGPA(marks, model);
        row.querySelector(".grd").innerText = g;
        row.querySelector(".gpa").innerText = p;
    }
}

// --- CALCULATION: SGPA ---
function calculateSGPA() {
    let rows = document.querySelectorAll("#courseTable tbody tr");
    let totalPts = 0, totalCr = 0;
    let model = document.getElementById("gradingModel").value;
    let error = false;

    rows.forEach((row) => {
        let inputs = row.getElementsByTagName("input");
        let cr = parseFloat(inputs[1].value);
        let mk = parseFloat(inputs[2].value);

        if(isNaN(cr) || cr < 1) { inputs[1].style.border="2px solid red"; error=true; }
        else inputs[1].style.border="1px solid #ccc";
        if(isNaN(mk) || mk < 0 || mk > 100) { inputs[2].style.border="2px solid red"; error=true; }
        else inputs[2].style.border="1px solid #ccc";

        if(!error && !isNaN(cr) && !isNaN(mk)) {
            let [gr, gp] = getGradeAndGPA(mk, model);
            row.querySelector(".grd").innerText = gr;
            row.querySelector(".gpa").innerText = gp;
            totalPts += (gp * cr);
            totalCr += cr;
        }
    });

    if(error) return;
    let final = totalCr > 0 ? (totalPts / totalCr).toFixed(2) : 0.00;
    document.getElementById("sgpa-result").innerHTML = `<h3>Semester GPA: ${final}</h3>`;
    saveToHistory(`SGPA: ${final}`, `${totalCr} Credits`);
}

// --- CALCULATION: CGPA (Old + New) ---
function calculateCGPA() {
    let oldCGPA = parseFloat(document.getElementById("currentCGPA").value);
    let oldCr = parseFloat(document.getElementById("completedCredits").value);
    let newSGPA = parseFloat(document.getElementById("newSGPA").value);
    let newCr = parseFloat(document.getElementById("newCredits").value);

    if(isNaN(oldCGPA) || isNaN(oldCr) || isNaN(newSGPA) || isNaN(newCr)) {
        document.getElementById("cgpa-result").innerHTML = "<p style='color:red'>Please fill all fields.</p>";
        return;
    }

    let totalPts = (oldCGPA * oldCr) + (newSGPA * newCr);
    let totalCredits = oldCr + newCr;
    let finalCGPA = (totalPts / totalCredits).toFixed(2);

    document.getElementById("cgpa-result").innerHTML = `<h3>New CGPA: ${finalCGPA}</h3><p>Total Credits: ${totalCredits}</p>`;
    saveToHistory(`CGPA: ${finalCGPA}`, `Total: ${totalCredits} Credits`);
}

// --- NEW CALCULATION: AVERAGE OF 8 SEMESTERS ---
function calculateAverage() {
    let inputs = document.querySelectorAll(".sem-input");
    let totalGPA = 0;
    let count = 0;

    inputs.forEach(input => {
        let val = parseFloat(input.value);
        if(!isNaN(val) && val > 0) {
            totalGPA += val;
            count++;
        }
    });

    if(count === 0) {
        document.getElementById("avg-result").innerHTML = "<p style='color:red'>Please enter at least one semester GPA.</p>";
        return;
    }

    let average = (totalGPA / count).toFixed(2);
    document.getElementById("avg-result").innerHTML = `<h3>Average GPA: ${average}</h3><p>Calculated from ${count} semester(s)</p>`;
    saveToHistory(`Avg GPA: ${average}`, `${count} Sems`);
}

// --- HISTORY ---
function toggleHistory() { document.getElementById("historyPanel").classList.toggle("hidden"); }
function saveToHistory(title, detail) {
    let hist = JSON.parse(localStorage.getItem("imsHistory")) || [];
    hist.unshift({ title, detail, time: new Date().toLocaleTimeString() });
    if(hist.length > 10) hist.pop();
    localStorage.setItem("imsHistory", JSON.stringify(hist));
    loadHistory();
}
function loadHistory() {
    let hist = JSON.parse(localStorage.getItem("imsHistory")) || [];
    let list = document.getElementById("historyList");
    list.innerHTML = "";
    hist.forEach(h => {
        let li = document.createElement("li");
        li.className = "history-item";
        li.innerHTML = `<strong>${h.title}</strong><br><small>${h.detail} @ ${h.time}</small>`;
        list.appendChild(li);
    });
}
function clearHistory() { localStorage.removeItem("imsHistory"); loadHistory(); }