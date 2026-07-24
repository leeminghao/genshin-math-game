'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const learning = require('../js/learning.js');

test('能力诊断只推荐受支持的三个能力入口', () => {
  assert.equal(learning.recommendRegion(0), 0);
  assert.equal(learning.recommendRegion(1), 0);
  assert.equal(learning.recommendRegion(2), 2);
  assert.equal(learning.recommendRegion(3), 4);
});

test('掌握度记录区分独立正确、纠正后正确与错因', () => {
  let state = learning.createLearningState();
  state = learning.recordAttempt(state, {
    skill: 'anemo', levelId: '0-0', correct: false, firstTry: true, hintTier: 0, now: 1
  });
  state = learning.recordAttempt(state, {
    skill: 'anemo', levelId: '0-0', correct: true, firstTry: false, hintTier: 2, now: 2
  });
  assert.deepEqual(state.mastery.anemo, {
    attempts: 2, correct: 1, independent: 0, transfer: 0, explained: 0,
    recovered: 1, score: 6, lastPlayed: 2
  });
  assert.equal(state.misconceptions['one-to-one'], 1);
  assert.equal(state.totalAnswers, 2);
  assert.equal(state.totalCorrect, 1);
});

test('星级分别表达完成、独立解答和迁移', () => {
  assert.equal(learning.calculateStars({ questionCount: 3, independentCorrect: 0 }), 1);
  assert.equal(learning.calculateStars({ questionCount: 3, independentCorrect: 2 }), 2);
  assert.equal(learning.calculateStars({
    questionCount: 3, independentCorrect: 2, transferFirstTry: true, transferHintTier: 1
  }), 3);
  assert.equal(learning.calculateStars({
    questionCount: 3, independentCorrect: 3, transferFirstTry: true, transferHintTier: 3
  }), 2);
});

test('事件日志有固定上限且保留最新事件', () => {
  let events = [];
  for (let i = 0; i < 8; i++) events = learning.appendEvent(events, 'answer', { i }, i, 5);
  assert.equal(events.length, 5);
  assert.deepEqual(events.map(event => event.data.i), [3, 4, 5, 6, 7]);
});

test('学习状态规范化会清理损坏字段', () => {
  const state = learning.normalizeLearning({
    diagnosticDone: 'yes', diagnosticScore: 99, suggestedRegion: 6, chosenStartRegion: 2,
    completedPuzzles: ['wind-one-to-one', 'bad', 'wind-one-to-one'],
    totalAnswers: 2, totalCorrect: 9,
    mastery: { anemo: { attempts: 2, correct: 9, independent: 7, score: 120 } }
  });
  assert.equal(state.diagnosticDone, false);
  assert.equal(state.diagnosticScore, 3);
  assert.equal(state.suggestedRegion, 0);
  assert.equal(state.chosenStartRegion, 2);
  assert.deepEqual(state.completedPuzzles, ['wind-one-to-one']);
  assert.equal(state.totalCorrect, 2);
  assert.deepEqual(state.mastery.anemo, {
    attempts: 2, correct: 2, independent: 2, transfer: 0, explained: 0,
    recovered: 0, score: 100, lastPlayed: 0
  });
});

test('风语原五个任务都具备完整学习闭环和不同情境迁移', () => {
  const missions = Object.entries(learning.WIND_MISSIONS);
  assert.deepEqual(missions.map(([levelId]) => levelId), ['0-0', '0-1', '0-2', '0-3', '0-4']);
  const types = new Set();
  missions.forEach(([levelId, mission]) => {
    assert.ok(mission.prediction.options.map(String).includes(String(mission.prediction.answer)), `${levelId} 预测答案缺失`);
    assert.ok(mission.expression.options.includes(mission.expression.answer), `${levelId} 表达答案缺失`);
    assert.equal(mission.primary.type, mission.transfer.type, `${levelId} 迁移必须复用数学关系`);
    assert.notEqual(mission.story, mission.transfer.story, `${levelId} 迁移必须更换表面情境`);
    assert.equal(mission.hints.operate.length, 3);
    assert.equal(mission.hints.express.length, 3);
    assert.equal(mission.hints.transfer.length, 3);
    types.add(mission.type);
  });
  assert.deepEqual([...types], ['match', 'partWhole', 'array', 'split', 'balance']);
});

test('任务检查点只保留受支持的关卡、阶段与安全交互字段', () => {
  let state = learning.createLearningState();
  state = learning.setMissionCheckpoint(state, '0-2', {
    phase: 'transfer', prediction: 12, predictionCorrect: true,
    interaction: { type: 'array', rows: 99, cols: 5, assignments: [1, -3, null] },
    expressionAttempts: 2, expressionCorrect: true, hintTier: 99,
    transferAttempts: 1, primaryErrors: 1, errorCount: 3, updatedAt: 123
  });
  assert.deepEqual(state.missionCheckpoints['0-2'], {
    missionId: 'wind-array', phase: 'transfer', prediction: 12, predictionCorrect: true,
    interaction: {
      type: 'array', assignments: [1, 0, null], moved: 0, rows: 99, cols: 5,
      left: 0, right: 0, pool: 0, leftAdded: 0, rightAdded: 0
    },
    expressionAttempts: 2, expressionCorrect: true, hintTier: 3,
    transferAttempts: 1, primaryErrors: 1, errorCount: 3, updatedAt: 123
  });
  state = learning.setMissionCheckpoint(state, 'bad-level', { phase: 'operate' });
  assert.equal(state.missionCheckpoints['bad-level'], undefined);
  state = learning.clearMissionCheckpoint(state, '0-2');
  assert.equal(state.missionCheckpoints['0-2'], undefined);
});

test('学习证据区分操作、语言和迁移，并生成可行动摘要', () => {
  let state = learning.createLearningState();
  state = learning.recordEvidence(state, {
    levelId: '0-3', kind: 'model', success: false, errorType: 'representation',
    expected: '每组 4 个', observed: '3、4、5', recovery: '逐轮给每组各放一个', at: 1
  });
  state = learning.recordEvidence(state, {
    levelId: '0-3', kind: 'model', success: true, independent: false, at: 2
  });
  state = learning.recordEvidence(state, {
    levelId: '0-3', kind: 'explanation', success: true, independent: true, at: 3
  });
  state = learning.recordEvidence(state, {
    levelId: '0-3', kind: 'transfer', success: true, independent: true, at: 4
  });
  assert.deepEqual(learning.summarizeEvidence(state), {
    evidenceCount: 4, independent: 2, transfer: 1, explanations: 1, recovered: 1,
    latestError: {
      levelId: '0-3', type: 'representation', expected: '每组 4 个', observed: '3、4、5',
      recovery: '逐轮给每组各放一个', at: 1
    }
  });
});
