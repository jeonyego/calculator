document.addEventListener('DOMContentLoaded', () => {
    const semesters = [
        { id: 's2_1', label: '2학년 1학기' },
        { id: 's2_2', label: '2학년 2학기' },
        { id: 's3_1', label: '3학년 1학기' },
        { id: 's3_2', label: '3학년 2학기' }
    ];

    const fullSubjects = [
        '국어', '사회', '역사', '도덕', '수학', '과학', '기술가정',
        '영어', '선택1', '선택2', '선택3', '체육', '음악', '미술'
    ];

    const limitedSubjects = ['체육', '음악', '미술'];

    const tableBody = document.getElementById('scoreTable');
    semesters.forEach((sem) => {
        const tr = document.createElement('tr');
        tr.id = sem.id;
        const semesterTd = document.createElement('td');
        semesterTd.innerHTML = `${sem.label}<br/><label><input type="checkbox" class="exclude-checkbox"> 제외</label>`;
        tr.appendChild(semesterTd);

        fullSubjects.forEach(subj => {
            const td = document.createElement('td');
            const select = document.createElement('select');
            select.id = `${sem.id}_${subj}`;

            const optionSelect = new Option('선택', '0');
            select.appendChild(optionSelect);

            const grades = limitedSubjects.includes(subj) ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D', 'E'];
            grades.forEach((grade, index) => {
                const value = 5 - index;
                const option = new Option(grade, value);
                select.appendChild(option);
            });

            const optionNone = new Option('없음', 'none');
            select.appendChild(optionNone);

            td.appendChild(select);
            tr.appendChild(td);
        });

        tableBody.appendChild(tr);
    });

    // Event delegation for exclude checkboxes
    document.querySelectorAll('.exclude-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            const row = event.target.closest('tr');
            if (event.target.checked) {
                row.classList.add('excluded');
                row.querySelectorAll('select').forEach(select => select.disabled = true);
            } else {
                row.classList.remove('excluded');
                row.querySelectorAll('select').forEach(select => select.disabled = false);
            }
        });
    });

    let academicScore = null;
    let attendanceScore = null;

    function calculateAll() {
        calculate();
        calculateAttendance();
        updateFinalScore();
    }

    function calculate() {
        let total = 0;
        let count = 0;
        let hasUnselected = false;
        document.getElementById('convertedScore').textContent = '-';

        semesters.forEach((sem) => {
            const row = document.getElementById(sem.id);
            if (row.classList.contains('excluded')) return;

            fullSubjects.forEach((subj) => {
                const selectEl = document.getElementById(`${sem.id}_${subj}`);
                const val = selectEl.value;

                if (val === "0") {
                    hasUnselected = true;
                    return;
                }
                if (val === "none") return;

                total += parseInt(val);
                count++;
            });
        });

        if (hasUnselected) {
            alert('성적을 모두 입력해주세요. \n성적이 없는 과목은 "없음"을 선택해주세요.');
            document.getElementById('result').textContent = '-';
            return;
        }

        const averageRaw = count > 0 ? total / count : 0;
        const averageRounded = Math.round(averageRaw * 1000) / 1000;
        document.getElementById('result').textContent = `성취도 평균: ${averageRounded.toFixed(3)} 점`;

        const gradeToScore = [
            [4.800, 160], [4.600, 159], [4.400, 158], [4.200, 156], [4.000, 154],
            [3.800, 152], [3.600, 149], [3.400, 146], [3.200, 143], [3.000, 140],
            [2.800, 136], [2.600, 132], [2.400, 127], [2.200, 122], [2.000, 117],
            [1.800, 112], [1.600, 107], [1.400, 103], [1.200, 101], [1.000, 100]
        ];

        let converted = 0;
        for (let [threshold, score] of gradeToScore) {
            if (averageRounded >= threshold) {
                converted = score;
                break;
            }
        }

        academicScore = converted;
        document.getElementById('convertedScore').textContent = `교과 점수: ${converted} 점`;
    }

    function calculateAttendance() {
        const late = parseInt(document.getElementById('late').value) || 0;
        const early = parseInt(document.getElementById('earlyLeave').value) || 0;
        const missing = parseInt(document.getElementById('missing').value) || 0;
        const absent = parseInt(document.getElementById('absence').value) || 0;
        const additionalAbsence = Math.floor((late + early + missing) / 3);
        const totalAbsence = additionalAbsence + absent;

        let score = 0;
        if (totalAbsence === 0) score = 40;
        else if (totalAbsence <= 2) score = 38;
        else if (totalAbsence <= 4) score = 34;
        else if (totalAbsence <= 6) score = 28;
        else score = 20;

        attendanceScore = score;
        document.getElementById('absence-days').textContent = `환산 미인정결석일수: ${totalAbsence}일`;
        document.getElementById('attendance-score-result').textContent = `출결 점수: ${score}점`;
    }

    function updateFinalScore() {
        if (academicScore !== null && attendanceScore !== null) {
            const total = academicScore + attendanceScore;
            document.getElementById('final-score').textContent = `내신 점수: ${total}점`;
        }
    }

    // --- 설명서 모달 관련 JavaScript ---
    const guideModal = document.getElementById('guideModal');
    const openGuideButton = document.getElementById('openGuideButton');
    const closeGuideButton = document.getElementById('closeGuideButton');
    const calculateAllButton = document.getElementById('calculateAllButton');

    openGuideButton.addEventListener('click', () => {
        guideModal.style.display = 'block';
    });

    closeGuideButton.addEventListener('click', () => {
        guideModal.style.display = 'none';
    });

    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', (event) => {
        if (event.target === guideModal) {
            guideModal.style.display = 'none';
        }
    });

    // 계산 버튼 이벤트 리스너 추가
    calculateAllButton.addEventListener('click', calculateAll);
});
