// background.js
const ACHIEVEMENTS = [
    { id: 'first_task', name: 'First Steps', description: 'Complete your first task', condition: (stats) => stats.tasksCompleted >= 1 },
    { id: 'level_10', name: 'Novice Adventurer', description: 'Reach level 10', condition: (stats) => stats.level >= 10 },
    { id: 'streak_7', name: 'Consistency is Key', description: 'Complete tasks for 7 days in a row', condition: (stats) => stats.streak >= 7 }
  ];
  
  chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({level: 1, xp: 0, tasksCompleted: 0, streak: 0, achievements: [], tasks: []}, function() {
      console.log("TaskQuest initialized");
    });
  });
  
  function checkAchievements() {
    chrome.storage.sync.get(['achievements', 'tasksCompleted', 'level', 'streak'], (result) => {
      const unlockedAchievements = result.achievements || [];
      const stats = {
        tasksCompleted: result.tasksCompleted || 0,
        level: result.level || 1,
        streak: result.streak || 0
      };
  
      ACHIEVEMENTS.forEach(achievement => {
        if (!unlockedAchievements.includes(achievement.id) && achievement.condition(stats)) {
          unlockedAchievements.push(achievement.id);
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'images/icon128.png',
            title: 'New Achievement Unlocked!',
            message: `${achievement.name}: ${achievement.description}`
          });
        }
      });
  
      chrome.storage.sync.set({achievements: unlockedAchievements});
    });
  }
  
  function addXP(amount) {
    chrome.storage.sync.get(['xp', 'level', 'tasksCompleted', 'streak'], (result) => {
      let xp = (result.xp || 0) + amount;
      let level = result.level || 1;
      let tasksCompleted = (result.tasksCompleted || 0) + 1;
      let streak = result.streak || 0;
      let nextLevelXp = level * 100;
  
      if (xp >= nextLevelXp) {
        level++;
        xp -= nextLevelXp;
      }
  
      // Update streak (this is a simplified version, you might want to add date checking)
      streak++;
  
      chrome.storage.sync.set({xp: xp, level: level, tasksCompleted: tasksCompleted, streak: streak}, () => {
        console.log("Stats updated");
        checkAchievements();
      });
    });
  }
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "addTask") {
      chrome.storage.sync.get(['tasks'], (result) => {
        const tasks = result.tasks || [];
        tasks.push({name: request.taskName, completed: false});
        chrome.storage.sync.set({tasks: tasks}, sendResponse);
      });
      return true; // Indicates we wish to send a response asynchronously
    } else if (request.action === "completeTask") {
      chrome.storage.sync.get(['tasks'], (result) => {
        const tasks = result.tasks || [];
        if (tasks[request.taskIndex]) {
          tasks[request.taskIndex].completed = true;
          chrome.storage.sync.set({tasks: tasks}, () => {
            addXP(10); // Add XP for completing a task
            sendResponse();
          });
        }
      });
      return true; // Indicates we wish to send a response asynchronously
    } else if (request.action === "addXP") {
      addXP(request.xp);
      sendResponse();
      return true;
    }
  });