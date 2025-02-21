import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  History, 
  Trash, 
  BarChart, 
  Book, 
  Target,
  Check,
  X 
} from 'lucide-react';
import './AttendanceManager.css';

const AttendanceManager = () => {
    const [mode, setMode] = useState(null);
    const [totalLectures, setTotalLectures] = useState('');
    const [attendedLectures, setAttendedLectures] = useState('');
    const [subjectCount, setSubjectCount] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [targetAttendance, setTargetAttendance] = useState('');
    const [result, setResult] = useState('');
    const [resultColor, setResultColor] = useState('black');
    const [showCalculateButtons, setShowCalculateButtons] = useState(false);
    const [showTargetForm, setShowTargetForm] = useState(false);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [showUserGuide, setShowUserGuide] = useState(false);
    const [theme, setTheme] = useState(() => {
      const savedTheme = localStorage.getItem('attendanceTheme');
      return savedTheme || 'light';
    });
  
    useEffect(() => {
      const savedHistory = localStorage.getItem('attendanceHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
      document.body.className = theme;
    }, [theme]);
  
    useEffect(() => {
      localStorage.setItem('attendanceHistory', JSON.stringify(history));
    }, [history]);
  
    const resetFields = () => {
      setTotalLectures('');
      setAttendedLectures('');
      setSubjectCount('');
      setSubjects([]);
      setTargetAttendance('');
      setResult('');
      setResultColor('black');
    };
  
    const handleCalculateAttendance = () => {
      resetFields();
      setMode('calculate');
      setShowCalculateButtons(!showCalculateButtons);
      setShowTargetForm(false);
      setShowHistory(false);
    };
  
    const handleAttendanceTarget = () => {
      resetFields();
      setMode('target');
      setShowTargetForm(!showTargetForm);
      setShowCalculateButtons(false);
      setShowHistory(false);
    };
  
    const toggleHistory = () => {
      setShowHistory(!showHistory);
      setShowCalculateButtons(false);
      setShowTargetForm(false);
    };
  
    const clearHistory = () => {
      setHistory([]);
      localStorage.removeItem('attendanceHistory');
    };
  
    const toggleTheme = () => {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      localStorage.setItem('attendanceTheme', newTheme);
    };
  
    const validateInput = (total, attended) => {
      return total > 0 && attended >= 0 && attended <= total;
    };
  
    const addToHistory = (calculationType, details, result) => {
      const newEntry = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        type: calculationType,
        details,
        totalCount: totalLectures,
        attendedCount: attendedLectures,
        result
      };
      setHistory(prevHistory => [newEntry, ...prevHistory].slice(0, 20));
    };
  
    const handleCalculateAggregate = (e) => {
      e.preventDefault();
  
      if (!validateInput(Number(totalLectures), Number(attendedLectures))) {
        setResult('⚠️ Please enter valid total and attended lectures.');
        setResultColor('text-red-500');
        return;
      }
  
      const attendance = (Number(attendedLectures) / Number(totalLectures)) * 100;
      const statusEmoji = attendance >= 75 ? '✅' : '⚠️';
      const message = `${statusEmoji} Your current attendance is ${attendance.toFixed(2)}%`;
      
      setResult(message);
      setResultColor(attendance >= 75 ? 'text-green-500' : 'text-red-500');
      
      addToHistory('Aggregate', 
        `Total: ${totalLectures}, Attended: ${attendedLectures}`, 
        `${attendance.toFixed(2)}%`
      );
    };
  
    const handleSubjectWise = (e) => {
      e.preventDefault();
  
      let totalClasses = 0;
      let totalAttended = 0;
      let valid = true;
      const subjectDetails = [];
  
      for (const subject of subjects) {
        const conducted = parseInt(subject.conducted) || 0;
        const attended = parseInt(subject.attended) || 0;
  
        if (conducted < attended) {
          valid = false;
          break;
        }
  
        totalClasses += conducted;
        totalAttended += attended;
        
        subjectDetails.push(`(${attended}/${conducted})`);
      }
  
      if (!valid || totalClasses === 0) {
        setResult('⚠️ Please enter valid conducted classes for each subject.');
        setResultColor('text-red-500');
        return;
      }
  
      const attendance = (totalAttended / totalClasses) * 100;
      const statusEmoji = attendance >= 75 ? '✅' : '⚠️';
      const message = `${statusEmoji} Your current attendance is ${attendance.toFixed(2)}%`;
      
      setResult(message);
      setResultColor(attendance >= 75 ? 'text-green-500' : 'text-red-500');
      
      setTotalLectures(totalClasses.toString());
      setAttendedLectures(totalAttended.toString());
      
      addToHistory('Subject-wise', 
        `Subjects: ${subjects.length}, Details: ${subjectDetails.join(', ')}`, 
        `${attendance.toFixed(2)}%`
      );
    };
  
    const handleTargetAttendance = (e) => {
      e.preventDefault();
  
      if (targetAttendance >= 100) {
        setResult('⚠️ Target attendance cannot be 100% or more.');
        setResultColor('text-red-500');
        return;
      }
  
      if (!validateInput(Number(totalLectures), Number(attendedLectures))) {
        setResult('⚠️ Please enter valid total and attended lectures.');
        setResultColor('text-red-500');
        return;
      }
  
      const currentAttendance = (Number(attendedLectures) / Number(totalLectures)) * 100;
  
      if (targetAttendance === 100 && Number(totalLectures) > Number(attendedLectures)) {
        setResult('⚠️ You cannot set target attendance to 100% if you have not attended all conducted lectures.');
        setResultColor('text-red-500');
        return;
      }
  
      if (targetAttendance <= 0 || targetAttendance >= 100) {
        setResult('⚠️ Please enter a valid target attendance percentage (0-99).');
        setResultColor('text-red-500');
        return;
      }
  
      let additionalLectures = 0;
      let adjustedTotal = Number(totalLectures);
      let adjustedAttended = Number(attendedLectures);
  
      if (currentAttendance < targetAttendance) {
        while ((adjustedAttended / adjustedTotal) * 100 < targetAttendance) {
          additionalLectures += 1;
          adjustedTotal += 1;
          adjustedAttended += 1;
        }
        const message = `⚠️ You need to attend ${additionalLectures} more lectures to reach your target attendance.`;
        setResult(message);
        setResultColor('text-yellow-500');
        addToHistory('Target (Need to attend)', 
          `Current: ${currentAttendance.toFixed(2)}%, Target: ${targetAttendance}%`, 
          `Need ${additionalLectures} more lectures`
        );
      } else {
        let lecturesCanMiss = 0;
        while ((adjustedAttended / (adjustedTotal + lecturesCanMiss)) * 100 >= targetAttendance) {
          lecturesCanMiss += 1;
        }
        lecturesCanMiss -= 1;
        const message = `✅ You can miss up to ${lecturesCanMiss} lectures and still meet your attendance target.`;
        setResult(message);
        setResultColor('text-green-500');
        addToHistory('Target (Can miss)', 
          `Current: ${currentAttendance.toFixed(2)}%, Target: ${targetAttendance}%`, 
          `Can miss ${lecturesCanMiss} lectures`
        );
      }
    };
  
    const handleSubjectCountChange = (count) => {
      if (parseInt(count) > 100) {
        setResult('⚠️ Maximum 100 subjects allowed.');
        setResultColor('text-red-500');
        setSubjectCount('100');
        setSubjects(Array.from({ length: 100 }, () => ({ conducted: '', attended: '' })));
      } else {
        setSubjectCount(count);
        setSubjects(Array.from({ length: parseInt(count) || 0 }, () => ({ conducted: '', attended: '' })));
        setResult('');
      }
    };
    const toggleUserGuide = () => {
      setShowUserGuide(!showUserGuide);
      if (!showUserGuide) {
        setShowHistory(false);
        setShowCalculateButtons(false);
        setShowTargetForm(false);
      }
    };

  return (
    <div className="am-container">
      <div className="am-header">
        <h1 className="am-title">
          <Calculator className="am-title-icon" /> Attendance Tracker
        </h1>
        <div className="am-controls">
          <button 
            onClick={toggleTheme}
            className="am-theme-toggle"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button 
            onClick={toggleHistory}
            className={`am-history-toggle ${showHistory ? 'am-active' : ''}`}
          >
            <History className="am-icon" />
          </button>
        </div>
      </div>

      {!showHistory && (
        <div className="am-mode-selector">
          <button 
            onClick={handleCalculateAttendance}
            className={`am-mode-button ${showCalculateButtons ? 'am-active-mode' : ''}`}
          >
            <BarChart className="am-icon" />
            <span>Calculate Attendance</span>
          </button>
          <button 
            onClick={handleAttendanceTarget}
            className={`am-mode-button ${showTargetForm ? 'am-active-mode' : ''}`}
          >
            <Target className="am-icon" />
            <span>Attendance Target</span>
          </button>
        </div>
      )}

      {showCalculateButtons && (
        <div className="am-calculation-type">
          <button 
            onClick={() => { setMode('aggregate'); resetFields(); }}
            className={`am-type-button ${mode === 'aggregate' ? 'am-active-type' : ''}`}
          >
            <Calculator className="am-icon" />
            <span>Aggregate</span>
          </button>
          <button 
            onClick={() => { setMode('subjectWise'); resetFields(); }}
            className={`am-type-button ${mode === 'subjectWise' ? 'am-active-type' : ''}`}
          >
            <Book className="am-icon" />
            <span>Subject Wise</span>
          </button>
        </div>
      )}

      {mode === 'aggregate' && (
        <div className="am-form-container">
          <h3 className="am-form-title">Aggregate Attendance</h3>
          <form onSubmit={handleCalculateAggregate} className="am-form">
            <div className="am-form-group">
              <label htmlFor="total-lectures" className="am-label">
                Total Lectures
              </label>
              <input
                id="total-lectures"
                type="number"
                className="am-input"
                placeholder="Total lectures conducted"
                value={totalLectures}
                onChange={(e) => setTotalLectures(e.target.value)}
                required
              />
            </div>
            <div className="am-form-group">
              <label htmlFor="attended-lectures" className="am-label">
                Attended Lectures
              </label>
              <input
                id="attended-lectures"
                type="number"
                className="am-input"
                placeholder="Lectures you attended"
                value={attendedLectures}
                onChange={(e) => setAttendedLectures(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              className="am-submit-button"
            >
              <Calculator className="am-icon" />
              <span>Calculate</span>
            </button>
          </form>
        </div>
      )}

      {mode === 'subjectWise' && (
        <div className="am-form-container">
          <h3 className="am-form-title">Subject Wise Attendance</h3>
          <form onSubmit={handleSubjectWise} className="am-form">
            <div className="am-form-group">
              <label htmlFor="subject-count" className="am-label">
                Number of Subjects (Max 100)
              </label>
              <input
                id="subject-count"
                type="number"
                className="am-input"
                placeholder="How many subjects?"
                value={subjectCount}
                onChange={(e) => handleSubjectCountChange(e.target.value)}
                max="100"
                required
              />
            </div>
            
            {subjects.length > 0 && (
              <div className="am-subjects-container">
                {subjects.map((subject, index) => (
                  <div key={index} className="am-subject-card">
                    <h4 className="am-subject-title">Subject {index + 1}</h4>
                    <div className="am-subject-fields">
                      <div className="am-form-group">
                        <label htmlFor={`conducted-${index}`} className="am-label">
                          Conducted
                        </label>
                        <input
                          id={`conducted-${index}`}
                          type="number"
                          className="am-input"
                          placeholder="Conducted"
                          value={subject.conducted}
                          onChange={(e) => {
                            const updatedSubjects = [...subjects];
                            updatedSubjects[index].conducted = e.target.value;
                            setSubjects(updatedSubjects);
                          }}
                          required
                        />
                      </div>
                      <div className="am-form-group">
                        <label htmlFor={`attended-${index}`} className="am-label">
                          Attended
                        </label>
                        <input
                          id={`attended-${index}`}
                          type="number"
                          className="am-input"
                          placeholder="Attended"
                          value={subject.attended}
                          onChange={(e) => {
                            const updatedSubjects = [...subjects];
                            updatedSubjects[index].attended = e.target.value;
                            setSubjects(updatedSubjects);
                          }}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {subjects.length > 0 && (
              <button 
                type="submit" 
                className="am-submit-button"
              >
                <Calculator className="am-icon" />
                <span>Calculate</span>
              </button>
            )}
          </form>
        </div>
      )}

      {showTargetForm && mode === 'target' && (
        <div className="am-form-container">
          <h3 className="am-form-title">Attendance Target</h3>
          <form onSubmit={handleTargetAttendance} className="am-form">
            <div className="am-form-group">
              <label htmlFor="target-total" className="am-label">
                Total Lectures
              </label>
              <input
                id="target-total"
                type="number"
                className="am-input"
                placeholder="Total lectures conducted"
                value={totalLectures}
                onChange={(e) => setTotalLectures(e.target.value)}
                required
              />
            </div>
            <div className="am-form-group">
              <label htmlFor="target-attended" className="am-label">
                Attended Lectures
              </label>
              <input
                id="target-attended"
                type="number"
                className="am-input"
                placeholder="Lectures you attended"
                value={attendedLectures}
                onChange={(e) => setAttendedLectures(e.target.value)}
                required
              />
            </div>
            <div className="am-form-group">
              <label htmlFor="target-percentage" className="am-label">
                Target Percentage
              </label>
              <input
                id="target-percentage"
                type="number"
                className="am-input"
                placeholder="Target attendance (%)"
                value={targetAttendance}
                onChange={(e) => setTargetAttendance(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              className="am-submit-button"
            >
              <Target className="am-icon" />
              <span>Calculate Target</span>
            </button>
          </form>
        </div>
      )}

      {result && (
        <div className={`am-result ${resultColor}`}>
          <p>{result}</p>
        </div>
      )}

      {showHistory && (
        <div className="am-history-container">
          <div className="am-history-header">
            <h3 className="am-history-title">
              <History className="am-icon" /> Calculation History
            </h3>
            {history.length > 0 && (
              <button 
                onClick={clearHistory}
                className="am-clear-history"
              >
                <Trash className="am-icon" /> Clear
              </button>
            )}
          </div>
          
          {history.length === 0 ? (
            <div className="am-empty-history">
              <p>No calculations yet. Start calculating to see your history here.</p>
            </div>
          ) : (
            <div className="am-history-list">
              {history.map(entry => (
                <div 
                  key={entry.id} 
                  className="am-history-entry"
                >
                  <div className="am-entry-header">
                    <span className="am-entry-type">{entry.type}</span>
                    <span className="am-entry-date">{entry.date}</span>
                  </div>
                  <div className="am-entry-content">
                    <p className="am-entry-details">
                      {entry.details}
                      {entry.totalCount && entry.attendedCount && (
                        <span className="am-total-attended-count">
                          <br />Total: {entry.totalCount}, Attended: {entry.attendedCount}
                        </span>
                      )}
                    </p>
                    <p className="am-entry-result">
                      {entry.result.includes('%') ? (
                        parseFloat(entry.result) >= 75 ? (
                          <Check className="am-status-icon success" />
                        ) : (
                          <X className="am-status-icon warning" />
                        )
                      ) : entry.result.includes('Can miss') ? (
                        <Check className="am-status-icon success" />
                      ) : (
                        <X className="am-status-icon warning" />
                      )}
                      <span className={
                        entry.result.includes('%')
                          ? parseFloat(entry.result) >= 75
                            ? 'success'
                            : 'warning'
                          : entry.result.includes('Can miss')
                          ? 'success'
                          : 'warning'
                      }>
                        {entry.result}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="am-footer">
  <p className="am-copyright" onClick={toggleUserGuide}>MADE BY AADITIYA</p>
</div>
{showUserGuide && (
  <div className="am-user-guide">
    <div className="am-guide-header">
      <h2>Attendance Tracker User Guide</h2>
      <button className="am-guide-close" onClick={toggleUserGuide}>×</button>
    </div>
    
    <div className="am-guide-content">
      <section className="am-guide-section">
        <h3>Getting Started</h3>
        <p>Welcome to Attendance Tracker! This app helps you calculate and manage your attendance records. It provides three main functions:</p>
        <ul>
          <li><strong>Aggregate Attendance:</strong> Calculate overall attendance based on total lectures</li>
          <li><strong>Subject-wise Attendance:</strong> Track attendance across multiple subjects (up to 100)</li>
          <li><strong>Target Attendance:</strong> Find out how many lectures you need to attend or can miss</li>
        </ul>
      </section>
      
      <section className="am-guide-section">
        <h3>Calculate Attendance</h3>
        <p><strong>Aggregate Method:</strong></p>
        <ol>
          <li>Click "Calculate Attendance" button</li>
          <li>Select "Aggregate" option</li>
          <li>Enter the total number of lectures conducted</li>
          <li>Enter the number of lectures you've attended</li>
          <li>Click "Calculate" to see your attendance percentage</li>
        </ol>
        
        <p><strong>Subject-wise Method:</strong></p>
        <ol>
          <li>Click "Calculate Attendance" button</li>
          <li>Select "Subject Wise" option</li>
          <li>Enter number of subjects (maximum 100)</li>
          <li>For each subject, enter conducted and attended lectures</li>
          <li>Click "Calculate" to see your combined attendance percentage</li>
        </ol>
      </section>
      
      <section className="am-guide-section">
        <h3>Attendance Target</h3>
        <p>To find out how many more lectures you need to attend or can afford to miss:</p>
        <ol>
          <li>Click "Attendance Target" button</li>
          <li>Enter your current total lectures and attended lectures</li>
          <li>Enter your target attendance percentage (0-99%)</li>
          <li>Click "Calculate Target"</li>
          <li>The app will tell you if you need to attend more lectures or how many you can miss</li>
        </ol>
      </section>
      
      <section className="am-guide-section">
        <h3>Tracking History</h3>
        <p>All your calculations are automatically saved to history:</p>
        <ul>
          <li>Click the history icon (clock) in the top right to view past calculations</li>
          <li>Each entry shows the calculation type, date, details, and result</li>
          <li>History is color-coded: green for good attendance, yellow/red for attention needed</li>
          <li>You can clear your history using the "Clear" button</li>
        </ul>
      </section>
      
      <section className="am-guide-section">
        <h3>Tips & Features</h3>
        <ul>
          <li>Toggle between light and dark mode using the moon/sun icon</li>
          <li>The app saves your history and theme preference between sessions</li>
          <li>75% is the standard attendance threshold for passing (shown in green)</li>
          <li>Maximum 100 subjects can be added for subject-wise calculation</li>
        </ul>
      </section>
    </div>
    
    <div className="am-guide-footer">
      <p>Created by Aaditiya © 2025</p>
    </div>
  </div>
)}
    </div>
  );
};

export default AttendanceManager;