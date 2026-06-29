export const autoSyncTasks = async (today: Date): Promise<any[]> => {
  const newTasks: any[] = [];
  try {
    const calendarState = localStorage.getItem("calendar_sync_state");
    const calendarToken = localStorage.getItem("google_calendar_token");
    const classroomState = localStorage.getItem("classroom_sync_state");
    const classroomToken = localStorage.getItem("google_classroom_token");

    // Fetch Calendar Events
    if (calendarState === "connected" && calendarToken) {
      const calRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${today.toISOString()}&maxResults=15&singleEvents=true&orderBy=startTime`,
        { headers: { Authorization: `Bearer ${calendarToken}` } }
      );
      if (calRes.ok) {
        const calData = await calRes.json();
        if (calData.items) {
          calData.items.forEach((event: any) => {
            if (event.summary && event.start) {
              const eventDate = new Date(event.start.dateTime || event.start.date);
              const isUrgent = (eventDate.getTime() - today.getTime()) < 48 * 60 * 60 * 1000;
              newTasks.push({
                title: `📅 ${event.summary}`,
                urgent: isUrgent,
                important: true,
                estimatedMinutes: 60,
                deadline: eventDate.toISOString().split('T')[0]
              });
            }
          });
        }
      }
    } else if (calendarState === "demo") {
      newTasks.push({
        title: `📅 (Demo) Project Sync Meeting`,
        urgent: true,
        important: true,
        estimatedMinutes: 45,
        deadline: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }

    // Fetch Classroom Assignments
    if (classroomState === "connected" && classroomToken) {
      const coursesRes = await fetch('https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE', {
        headers: { Authorization: `Bearer ${classroomToken}` }
      });
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        if (coursesData.courses) {
          for (const course of coursesData.courses.slice(0, 5)) {
            const cwRes = await fetch(`https://classroom.googleapis.com/v1/courses/${course.id}/courseWork`, {
              headers: { Authorization: `Bearer ${classroomToken}` }
            });
            if (cwRes.ok) {
              const cwData = await cwRes.json();
              if (cwData.courseWork) {
                cwData.courseWork.forEach((work: any) => {
                  let isUrgent = false;
                  let deadline = undefined;
                  if (work.dueDate) {
                    const dueDate = new Date(work.dueDate.year, work.dueDate.month - 1, work.dueDate.day);
                    if (dueDate < today) return;
                    isUrgent = (dueDate.getTime() - today.getTime()) < 3 * 24 * 60 * 60 * 1000;
                    deadline = dueDate.toISOString().split('T')[0];
                  }
                  newTasks.push({
                    title: `🎓 ${work.title} (${course.name})`,
                    urgent: isUrgent,
                    important: true,
                    estimatedMinutes: 90,
                    deadline: deadline
                  });
                });
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("Auto-sync failed", err);
  }
  return newTasks;
};
