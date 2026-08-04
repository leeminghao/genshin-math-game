'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  QUESTION_GENERATORS,
  generateQuestions,
  setQuestionRandom
} = require('../js/data.js');

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => ((value = (1664525 * value + 1013904223) >>> 0) / 4294967296);
}

function numericAnswer(question) {
  const value = Number(question.answer);
  assert.ok(Number.isFinite(value), `答案不是数字：${question.answer}`);
  return value;
}

function parseMoney(text) {
  const yuan = Number(text.match(/(\d+)\s*元/)?.[1] || 0);
  const jiao = Number(text.match(/(\d+)\s*角/)?.[1] || 0);
  return yuan * 10 + jiao;
}

function parseClock(clock) {
  const [, hour, minute] = String(clock).match(/^(\d+):(\d{2})$/) || [];
  assert.notEqual(hour, undefined, `非法时刻：${clock}`);
  assert.ok(Number(minute) < 60, `分钟越界：${clock}`);
  return Number(hour) * 60 + Number(minute);
}

function rationalValue(text) {
  const match = String(text).match(/^(\d+)(?:\/(\d+))?$/);
  assert.ok(match, `非法分数：${text}`);
  return Number(match[1]) / Number(match[2] || 1);
}

function ratioValue(text) {
  const match = String(text).match(/^(\d+):(\d+)$/);
  assert.ok(match, `非法比：${text}`);
  return Number(match[1]) / Number(match[2]);
}

function assertClose(actual, expected, message) {
  assert.ok(Math.abs(actual - expected) < 1e-9, `${message}：实际 ${actual}，应为 ${expected}`);
}

test('所有动态题目在 1000 个固定种子下结构有效', () => {
  const levelIds = Object.keys(QUESTION_GENERATORS);
  assert.equal(levelIds.length, 25);
  for (let seed = 1; seed <= 1000; seed++) {
    setQuestionRandom(seededRandom(seed));
    for (const levelId of levelIds) {
      const questions = generateQuestions(levelId);
      assert.ok(questions.length >= 3 && questions.length <= 4, `${levelId} 题量异常`);
      questions.forEach(question => {
        if (question.interaction) return; // 动手题由 validateQuestion 走交互结构校验
        assert.equal(question.options.length, 4);
        assert.equal(new Set(question.options.map(String)).size, 4);
        assert.equal(question.options.map(String).filter(value => value === String(question.answer)).length, 1);
      });
    }
  }
  setQuestionRandom();
});

test('曾出现随机值错配的题型由同一组数据推导答案', () => {
  for (let seed = 1; seed <= 500; seed++) {
    setQuestionRandom(seededRandom(seed));

    let q = generateQuestions('0-2')[0];
    let match = q.text.match(/每排有 (\d+) 棵树，一共有 (\d+) 排/);
    assert.equal(q.answer, `${match[2]} × ${match[1]}`);

    q = generateQuestions('1-1')[2];
    let nums = [...q.text.matchAll(/(\d+)cm/g)].map(item => Number(item[1]));
    assert.ok(nums[0] + nums[1] > nums[2] && Math.abs(nums[0] - nums[1]) < nums[2], '三角形必须非退化');
    assert.equal(numericAnswer(q), nums.reduce((sum, value) => sum + value, 0));

    let questions = generateQuestions('2-1');
    match = questions[0].text.match(/一支笔 (\d+) 角/);
    assert.equal(parseMoney(questions[0].answer), 10 - Number(match[1]));
    match = questions[1].text.match(/练习册 (\d+) 元 (\d+) 角/);
    assert.equal(parseMoney(questions[1].answer), (Number(match[1]) * 10 + Number(match[2])) * 2);
    match = questions[2].text.match(/有 (\d+) 张 1 元、(\d+) 张 5 角/);
    assert.equal(parseMoney(questions[2].answer), Number(match[1]) * 10 + Number(match[2]) * 5);

    questions = generateQuestions('2-3');
    match = questions[1].text.match(/从 (\d+:\d{2}) 上到 (\d+:\d{2})/);
    assert.equal(parseClock(match[2]) - parseClock(match[1]), numericAnswer(questions[1]));
    match = questions[2].text.match(/从 (\d+:\d{2}).*做了 1 小时 (\d+) 分/);
    assert.equal(parseClock(questions[2].answer), parseClock(match[1]) + 60 + Number(match[2]));

    questions = generateQuestions('3-0');
    match = questions[0].text.match(/苹果 (\d+) 人、香蕉 (\d+) 人、西瓜 (\d+) 人/);
    nums = match.slice(1).map(Number);
    assert.equal(nums.filter(value => value === Math.max(...nums)).length, 1, '最多项必须唯一');
    assert.equal(questions[0].answer, ['苹果', '香蕉', '西瓜'][nums.indexOf(Math.max(...nums))]);
    match = questions[2].text.match(/每格代表 (\d+) 人.*高 (\d+) 格/);
    assert.equal(numericAnswer(questions[2]), Number(match[1]) * Number(match[2]));

    q = generateQuestions('3-1')[0];
    nums = [...q.text.matchAll(/(\d+) 页/g)].map(item => Number(item[1]));
    assert.equal(numericAnswer(q), nums.reduce((sum, value) => sum + value, 0) / 3);

    q = generateQuestions('3-2')[0];
    match = q.text.match(/有 (\d+) 个红球、(\d+) 个白球/);
    assertClose(rationalValue(q.answer), Number(match[1]) / (Number(match[1]) + Number(match[2])), '红球概率');

    q = generateQuestions('4-1')[2];
    match = q.text.match(/一个数的 (\d+) 倍减去 (\d+) 等于 (-?\d+)/);
    assert.equal(numericAnswer(q), (Number(match[3]) + Number(match[2])) / Number(match[1]));

    questions = generateQuestions('4-2');
    match = questions[0].text.match(/向西走 (\d+) 米/);
    assert.equal(questions[0].answer, `-${match[1]} 米`);
    match = questions[2].text.match(/最低气温 -(\d+)℃，最高气温 (\d+)℃/);
    assert.equal(numericAnswer(questions[2]), Number(match[1]) + Number(match[2]));

    questions = generateQuestions('4-3');
    match = questions[0].text.match(/(\d+)\/(\d+) 的分数单位/);
    assertClose(rationalValue(questions[0].answer), 1 / Number(match[2]), '分数单位');
    match = questions[1].text.match(/1\/(\d+) \+ 1\/(\d+)/);
    assertClose(rationalValue(questions[1].answer), 1 / Number(match[1]) + 1 / Number(match[2]), '异分母加法');
    match = questions[2].text.match(/(\d+)\/(\d+) - (\d+)\/(\d+)/);
    assertClose(rationalValue(questions[2].answer), Number(match[1]) / Number(match[2]) - Number(match[3]) / Number(match[4]), '同分母减法');

    questions = generateQuestions('5-0');
    match = questions[0].text.match(/把 (\d+):(\d+)/);
    assertClose(ratioValue(questions[0].answer), Number(match[1]) / Number(match[2]), '化简比');
    match = questions[1].text.match(/男生 (\d+) 人，女生 (\d+) 人/);
    assertClose(ratioValue(questions[1].answer), Number(match[1]) / Number(match[2]), '人数比');
    match = questions[2].text.match(/前项是 (\d+)，比值是 (\d+)/);
    assert.equal(numericAnswer(questions[2]), Number(match[1]) / Number(match[2]));

    q = generateQuestions('5-1')[1];
    match = q.text.match(/某班有 (\d+) 人，男生占 (\d+)%/);
    assert.equal(numericAnswer(q), Number(match[1]) * Number(match[2]) / 100);
    assert.ok(Number.isInteger(numericAnswer(q)), '人数答案必须是整数');

    questions = generateQuestions('6-0');
    match = questions[1].text.match(/r = (\d+)cm/);
    assertClose(numericAnswer(questions[1]), 2 * 3.14 * Number(match[1]), '圆周长');
    match = questions[2].text.match(/r = (\d+)cm/);
    assertClose(numericAnswer(questions[2]), 3.14 * Number(match[1]) ** 2, '圆面积');

    q = generateQuestions('6-1')[2];
    match = q.text.match(/底面积 (\d+)cm²、高 (\d+)cm/);
    assert.equal(numericAnswer(q), Number(match[1]) * Number(match[2]));

    questions = generateQuestions('6-2');
    match = questions[0].text.match(/看了 (\d+)\/(\d+)，还剩 (\d+) 页/);
    assert.equal(numericAnswer(questions[0]), Number(match[3]) * Number(match[2]) / (Number(match[2]) - Number(match[1])));
    match = questions[1].text.match(/相距 (\d+) 千米，汽车 (\d+) 小时.* (\d+)\/(\d+)/);
    assert.equal(numericAnswer(questions[1]), Number(match[1]) * Number(match[3]) / Number(match[4]) / Number(match[2]));
    match = questions[2].text.match(/面积 (\d+)cm²，底 (\d+)cm/);
    assert.equal(numericAnswer(questions[2]), Number(match[1]) * 2 / Number(match[2]));
    match = questions[3].text.match(/2\(x \+ (\d+)\) = (\d+)/);
    assert.equal(numericAnswer(questions[3]), Number(match[2]) / 2 - Number(match[1]));
  }
  setQuestionRandom();
});

test('分数、比和人民币选项没有数值等价重复项', () => {
  for (let seed = 1; seed <= 500; seed++) {
    setQuestionRandom(seededRandom(seed));
    for (const levelId of ['3-2', '4-3']) {
      generateQuestions(levelId).forEach(question => {
        const values = question.options.map(rationalValue);
        assert.equal(new Set(values).size, 4, `${levelId} 存在等价分数选项`);
      });
    }
    generateQuestions('5-0').slice(0, 2).forEach(question => {
      const values = question.options.map(ratioValue);
      assert.equal(new Set(values).size, 4, '5-0 存在等价比选项');
    });
    generateQuestions('2-1').forEach(question => {
      const values = question.options.map(parseMoney);
      assert.equal(new Set(values).size, 4, '2-1 存在等价人民币选项');
    });
  }
  setQuestionRandom();
});
