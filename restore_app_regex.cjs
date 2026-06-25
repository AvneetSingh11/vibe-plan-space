const fs = require('fs');
let content = fs.readFileSync('./src/App.tsx', 'utf8');

// The tabs are separated by comments, e.g., {/* Matrix Tab */}
const matrixStart = '{/* Matrix Tab */}';
const habitsStart = '{/* Habits Tab */}';
const mindStart = '{/* Mind Tab */}';
const voiceStart = '{/* Voice Tab */}';
const endMarker = '    </main>';

const matrixIndex = content.indexOf(matrixStart);
const habitsIndex = content.indexOf(habitsStart);
const mindIndex = content.indexOf(mindStart);
const voiceIndex = content.indexOf(voiceStart);
const endIndex = content.indexOf(endMarker, voiceIndex);

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
  console.log('Successfully replaced tabs using substring markers!');
} else {
  console.log('Failed to find substring markers.');
}
