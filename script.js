document.addEventListener("DOMContentLoaded", () => {
    loadHistory();
    addRow(); // Start with one empty row
});

// --- 1. PRESETS & DATA ---
const presets = {
    "cs_1": [
        { name: "Intro to ICT", credit: 3 },
        { name: "Programming Fundamentals", credit: 4 },
        { name: "English Comp", credit: 3 },
        { name: "Calculus", credit: 3 }
    ],
    "cs_2": [
        { name: "OOP", credit: 4 },
        { name: "Discrete Structures", credit: 3 },
        { name: "Comm Skills", credit: 3 }
    ],
    "bba_1": [
        { name: "Microeconomics", credit: 3 },
        { name: "Business Math", credit: 3 },
        { name: "Intro to Business", credit: 3 }
    ]
};

// --- 2. GRADING MODELS ---
function getGradeAndGPA(marks, model) {
    marks = parseFloat(marks);
    if (model === "strict") {
        if (marks >= 95) return ["A+", 4.0];
        if (marks >= 90) return ["A", 4.0];
        if (marks >= 85) return ["B+", 3.5];
        if (marks >= 80) return ["B", 3.0];
        return ["F", 0.0];
    } 
    else if (model === "linear") {
        // Simple calculation: Marks / 20 - 1 (Roughly)
        let gpa = (marks / 20) - 1; 
        if(gpa > 4.0) gpa = 4.0;
        if(gpa < 0) gpa = 0.0;
        return [gpa.toFixed(1), gpa.toFixed(2)];
    } 
    else { 
        // STANDARD (IMS Default)
        if (marks >= 91) return ["A+", 4.0];
        else if (marks >= 87) return ["A", 4.0];
        else if (marks >= 80) return ["B+", 3.5];
        else if (marks >= 72) return ["B", 3.0];
        else if (marks >= 66) return ["C+", 2.5];
        else if (marks >= 60) return ["C", 2.0];
        else return ["F", 0.0];
    }
}

// --- 3. TABLE MANAGEMENT ---

function addRow(name = "", credit = "", marks = "") {
    let table = document.getElementById("courseTable").getElementsByTagName('tbody')[0];
    let row = table.insertRow();

    row.innerHTML = `
        <td><input type="text" placeholder="Subject" value="${name}"></td>
        <td><input type="number" placeholder="Credit" min="1" max="4" value="${credit}"></td>
        <td><input type="number" placeholder="Marks" min="0" max="100" value="${marks}" oninput="autoCalcRow(this)"></td>
        <td class="grade-cell">-</td>
        <td class="gpa-cell">-</td>
        <td><button class="delete-btn" onclick="deleteRow(this)"><i class="fas fa-trash"></i></button></td>
    `;
}

// Feature: Mistake Removing (Delete Row)
function deleteRow(btn) {
    let row = btn.parentNode.parentNode;
    row.parentNode.removeChild(row);
}

// Feature: Reset Table
function resetTable() {
    document.getElementById("courseTable").getElementsByTagName('tbody')[0].innerHTML = "";
    document.getElementById("result").innerText = "";
    addRow(); // Add one fresh row
}

// Feature: Presets
function loadPreset() {
    let select = document.getElementById("presetSelect");
    let key = select.value;
    
    if (key && presets[key]) {
        // Clear current table
        let tbody = document.getElementById("courseTable").getElementsByTagName('tbody')[0];
        tbody.innerHTML = "";
        
        // Load preset rows
        presets[key].forEach(subject => {
            addRow(subject.name, subject.credit, "");
        });
    }
}

// Optional: Auto-calculate row GPA as you type marks
function autoCalcRow(input) {
    let row = input.parentNode.parentNode;
    let marks = input.value;
    let model = document.getElementById("gradingModel").value;
    
    if(marks) {
        let [grade, gpa] = getGradeAndGPA(marks, model);
        row.querySelector('.grade-cell').innerText = grade;
        row.querySelector('.gpa-cell').innerText = gpa;
    }
}

// --- 4. CALCULATION & HISTORY ---

function calculateGPA() {
    let tbody = document.getElementById("courseTable").getElementsByTagName('tbody')[0];
    let rows = tbody.rows;
    let totalPoints = 0;
    let totalCredits = 0;
    let errorMessages = []; 
    let model = document.getElementById("gradingModel").value;

    for (let i = 0; i < rows.length; i++) {
        let inputs = rows[i].getElementsByTagName("input");
        let credit = parseFloat(inputs[1].value);
        let marks = parseFloat(inputs[2].value);

        if (isNaN(credit) || credit < 1) {
            inputs[1].style.border = "2px solid red";
            errorMessages.push(`Row ${i+1}: Invalid Credit`);
        } else {
            inputs[1].style.border = "";
        }

        if (isNaN(marks) || marks < 0 || marks > 100) {
            inputs[2].style.border = "2px solid red";
            errorMessages.push(`Row ${i+1}: Invalid Marks`);
        } else {
            inputs[2].style.border = "";
        }

        if (errorMessages.length === 0) {
            let [grade, gpa] = getGradeAndGPA(marks, model);
            rows[i].querySelector('.grade-cell').innerText = grade;
            rows[i].querySelector('.gpa-cell').innerText = gpa;
            totalPoints += (gpa * credit);
            totalCredits += credit;
        }
    }

    if (errorMessages.length > 0) return;

    let finalGPA = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0.00;
    
    // Display Result
    let resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `<h3>Semester GPA: ${finalGPA}</h3>`;

    // Save to Local History
    saveToHistory(finalGPA, totalCredits);
}

// --- 5. LOCAL HISTORY STORAGE ---

function toggleHistory() {
    document.getElementById("historyPanel").classList.toggle("hidden");
}

function saveToHistory(gpa, credits) {
    let history = JSON.parse(localStorage.getItem("gpaHistory")) || [];
    let date = new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
    
    let entry = { gpa: gpa, credits: credits, date: date };
    history.unshift(entry); // Add to top
    
    // Limit to last 10 entries
    if(history.length > 10) history.pop();

    localStorage.setItem("gpaHistory", JSON.stringify(history));
    loadHistory(); // Refresh UI
}

function loadHistory() {
    let history = JSON.parse(localStorage.getItem("gpaHistory")) || [];
    let list = document.getElementById("historyList");
    list.innerHTML = "";

    history.forEach(item => {
        let li = document.createElement("li");
        li.className = "history-item";
        li.innerHTML = `<strong>GPA: ${item.gpa}</strong> <br> <small>${item.credits} Cr.Hrs | ${item.date}</small>`;
        list.appendChild(li);
    });
}

function clearHistory() {
    if(confirm("Delete all history?")) {
        localStorage.removeItem("gpaHistory");
        loadHistory();
    }
}
// ... Keep previous code (presets, grading models, addRow, etc.) ...

// --- TAB SYSTEM ---
function openTab(tabName) {
    // Hide all tab content
    document.querySelectorAll('.tab-content').forEach(div => {
        div.style.display = 'none';
    });
    
    // Remove active class from buttons
    document.querySelectorAll('.tab-link').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab and activate button
    document.getElementById(tabName).style.display = 'block';
    // Note: In a real app, you'd target the specific button clicked to add 'active' class
    event.currentTarget.classList.add('active');
}

// --- SGPA CALCULATION (Renamed from calculateGPA) ---
function calculateSGPA() {
    // ... [Use the code from the previous response here] ...
    // Make sure to output to document.getElementById("sgpa-result")
    
    // Example snippet:
    // document.getElementById("sgpa-result").innerHTML = `<h3>Semester GPA: ${finalGPA}</h3>`;
}

// --- NEW: CGPA CALCULATION ---
function calculateCGPA() {
    // 1. Get Values
    let oldCGPA = parseFloat(document.getElementById("currentCGPA").value);
    let oldCredits = parseFloat(document.getElementById("completedCredits").value);
    let newSGPA = parseFloat(document.getElementById("newSGPA").value);
    let newCredits = parseFloat(document.getElementById("newCredits").value);

    // 2. Validation
    let resultBox = document.getElementById("cgpa-result");
    if (isNaN(oldCGPA) || isNaN(oldCredits) || isNaN(newSGPA) || isNaN(newCredits)) {
        resultBox.innerHTML = "<span style='color:red'>Please fill all fields correctly.</span>";
        return;
    }

    // 3. The Math (Falana Falana Formula)
    // Formula: ((Old CGPA * Old Credits) + (New SGPA * New Credits)) / Total Credits
    
    let totalOldPoints = oldCGPA * oldCredits;
    let totalNewPoints = newSGPA * newCredits;
    let totalCredits = oldCredits + newCredits;
    
    let finalCGPA = (totalOldPoints + totalNewPoints) / totalCredits;
    
    // 4. Output
    resultBox.innerHTML = `
        <h3>New CGPA: ${finalCGPA.toFixed(2)}</h3>
        <p>Total Credit Hours: ${totalCredits}</p>
    `;

    // Optional: Save to history
    saveToHistory(finalCGPA.toFixed(2), totalCredits);
}

// Ensure default tab is open on load
document.addEventListener("DOMContentLoaded", () => {
    loadHistory();
    addRow(); 
    // Open default tab manually if needed, or rely on HTML "active" class
});