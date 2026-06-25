const fs = require('fs');
let content = fs.readFileSync('./src/App.tsx', 'utf8');

const dashboardEndPattern = '    {/* END DASHBOARD CONTENT (conceptual) */}'; // It doesn't exist.
// Let's find the `activeTab === "matrix"`
const matrixStart = '{activeTab === "matrix" && (';
const matrixIndex = content.indexOf(matrixStart);
const endIndex = content.lastIndexOf('</main>');

if (matrixIndex !== -1 && endIndex !== -1) {
  const replacement = `
    {/* Matrix Tab */}
    {activeTab === "matrix" && (
      <EisenhowerMatrix
        tasks={tasks}
        onToggleComplete={toggleTaskComplete}
        onDeleteTask={deleteTask}
        onToggleUrgent={toggleTaskUrgent}
        onToggleImportant={toggleTaskImportant}
      />
    )}

    {/* Habits Tab */}
    {activeTab === "habits" && (
      <HabitTracker
        habits={habits}
        onToggleHabit={toggleHabit}
        onAddHabit={addHabit}
        onDeleteHabit={deleteHabit}
      />
    )}

    {/* Mind Tab */}
    {activeTab === "mind" && (
      <HowWeFeelHub 
        emotionLogs={emotionLogs}
        onLogEmotion={logEmotion}
        tasks={tasks}
      />
    )}

    {/* Voice Tab */}
    {activeTab === "voice" && (
      <VoiceAssistant
        onAddTask={addTask}
        onTriggerBriefing={handleTriggerBriefing}
        onSetBreakdownGoal={setBreakdownGoal}
        onAddNotification={addNotification}
      />
    )}
    `;
  
  content = content.substring(0, matrixIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync('./src/App.tsx', content);
  console.log('Successfully replaced tabs with components!');
} else {
  console.log('Could not find matrix start or </main>');
}
