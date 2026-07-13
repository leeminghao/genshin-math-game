package com.mathisland.foldtower;

import java.util.Arrays;

final class GameState {
    static final int LEVEL_COUNT = 7;

    final boolean[] completed = new boolean[LEVEL_COUNT];
    final boolean[] areaTiles = new boolean[12];

    int currentLevel = -1;
    int stonesPlaced = 0;
    int onesPlaced = 0;
    int rotationStep = 0;
    int arrayCols = 1;
    boolean smallHalfPlaced = false;
    boolean bigHalfPlaced = false;
    String selectedHalf = "";
    int coordCol = 1;
    int coordRow = 1;
    String feedback = "点亮第一层。";
    String lastReward = "";
    int cognition = 0;
    int combo = 0;
    int burstSerial = 0;
    int feedbackSerial = 0;

    void startLevel(int level) {
        if (level < 0 || level >= LEVEL_COUNT) return;
        currentLevel = level;
        resetLevel();
    }

    void goHome() {
        currentLevel = -1;
        feedback = "选择一层数学塔。";
        feedbackSerial += 1;
    }

    void resetLevel() {
        stonesPlaced = 0;
        onesPlaced = 0;
        rotationStep = 0;
        arrayCols = 1;
        Arrays.fill(areaTiles, false);
        smallHalfPlaced = false;
        bigHalfPlaced = false;
        selectedHalf = "";
        coordCol = 1;
        coordRow = 1;
        lastReward = "";
        feedback = instruction();
        feedbackSerial += 1;
    }

    void nextLevel() {
        if (currentLevel < 0) return;
        int next = currentLevel + 1;
        if (next >= LEVEL_COUNT) {
            goHome();
        } else {
            startLevel(next);
        }
    }

    void placeStone() {
        if (currentLevel != 0) return;
        if (stonesPlaced < 3) {
            stonesPlaced += 1;
            feedback = stonesPlaced == 3 ? "三步都有石头了。" : "一块石头配一步。";
        } else {
            feedback = "多出的一块先留下。";
        }
        completeCurrentLevelIfSolved();
        feedbackSerial += 1;
    }

    void placeOneBlock() {
        if (currentLevel != 1) return;
        if (onesPlaced < 10) {
            onesPlaced += 1;
        }
        if (onesPlaced < 10) {
            feedback = "还差 " + (10 - onesPlaced) + " 个一。";
        } else {
            feedback = "10个一捆成1个十。";
        }
        completeCurrentLevelIfSolved();
        feedbackSerial += 1;
    }

    void rotateTower() {
        if (currentLevel != 2) return;
        rotationStep = (rotationStep + 1) % 4;
        feedback = rotationStep == 1 ? "90度，端点接上了。" : "端点没接上。";
        completeCurrentLevelIfSolved();
        feedbackSerial += 1;
    }

    void setArrayCols(int cols) {
        if (currentLevel != 3) return;
        arrayCols = Math.max(1, Math.min(4, cols));
        if (arrayCols < 3) {
            feedback = "桥短 " + (3 - arrayCols) + " 列。";
        } else if (arrayCols > 3) {
            feedback = "多出 " + (arrayCols - 3) + " 列。";
        } else {
            feedback = "2行3列，一共6格。";
        }
        completeCurrentLevelIfSolved();
        feedbackSerial += 1;
    }

    void placeAreaTile(int index) {
        if (currentLevel != 4 || index < 0 || index >= areaTiles.length) return;
        areaTiles[index] = true;
        feedback = solved() ? "铺满了，没有空洞。" : "继续铺满空格。";
        completeCurrentLevelIfSolved();
        feedbackSerial += 1;
    }

    void selectHalf(String half) {
        if (currentLevel != 5) return;
        selectedHalf = half;
        feedback = "把这半块放回它的整圆。";
        feedbackSerial += 1;
    }

    void placeHalf(String door) {
        if (currentLevel != 5 || selectedHalf.length() == 0) return;
        boolean matchSmall = "small".equals(selectedHalf) && "small".equals(door);
        boolean matchBig = "big".equals(selectedHalf) && "big".equals(door);
        if (matchSmall) {
            smallHalfPlaced = true;
            feedback = "小圆的一半回去了。";
        } else if (matchBig) {
            bigHalfPlaced = true;
            feedback = "大圆的一半回去了。";
        } else {
            feedback = "先看是谁的一半。";
        }
        selectedHalf = "";
        completeCurrentLevelIfSolved();
        feedbackSerial += 1;
    }

    void cycleCol() {
        if (currentLevel != 6) return;
        coordCol = coordCol == 3 ? 1 : coordCol + 1;
        feedback = coordText();
        completeCurrentLevelIfSolved();
        feedbackSerial += 1;
    }

    void cycleRow() {
        if (currentLevel != 6) return;
        coordRow = coordRow == 4 ? 1 : coordRow + 1;
        feedback = coordText();
        completeCurrentLevelIfSolved();
        feedbackSerial += 1;
    }

    void tryGoal() {
        if (currentLevel < 0) return;
        if (completed[currentLevel]) {
            nextLevel();
            return;
        }
        if (solved()) {
            completeCurrentLevelIfSolved();
        } else {
            combo = 0;
            feedback = blockedText();
        }
        feedbackSerial += 1;
    }

    void hint() {
        if (currentLevel < 0) {
            feedback = "从第一层开始。";
        } else {
            feedback = hintText();
        }
        feedbackSerial += 1;
    }

    boolean solved() {
        if (currentLevel == 0) return stonesPlaced == 3;
        if (currentLevel == 1) return onesPlaced == 10;
        if (currentLevel == 2) return rotationStep == 1;
        if (currentLevel == 3) return arrayCols == 3;
        if (currentLevel == 4) {
            for (boolean tile : areaTiles) {
                if (!tile) return false;
            }
            return true;
        }
        if (currentLevel == 5) return smallHalfPlaced && bigHalfPlaced;
        if (currentLevel == 6) return coordCol == 2 && coordRow == 3;
        return false;
    }

    private void completeCurrentLevelIfSolved() {
        if (currentLevel < 0 || completed[currentLevel] || !solved()) return;
        completed[currentLevel] = true;
        int gain = reward(currentLevel);
        cognition += gain;
        combo += 1;
        burstSerial += 1;
        lastReward = "点亮 +" + gain + " 认知能量";
        feedback = "门亮了，点门前进。";
    }

    int rotationDegrees() {
        return rotationStep * 90;
    }

    boolean rotationIsRightAngle() {
        return rotationDegrees() == 90;
    }

    String levelName(int level) {
        switch (level) {
            case 0: return "一步一石桥";
            case 1: return "十个一成一个十";
            case 2: return "会转的楼梯";
            case 3: return "阵列花园";
            case 4: return "方格广场";
            case 5: return "半月折廊";
            case 6: return "列行星塔";
            default: return "折折数学塔";
        }
    }

    String title() {
        return currentLevel < 0 ? "折折数学塔" : levelName(currentLevel);
    }

    String instruction() {
        switch (currentLevel) {
            case 0: return "一块石头配一步。";
            case 1: return "把10个一送进捆扎机。";
            case 2: return "转动蓝环，让楼梯接上。";
            case 3: return "拉出2行3列。";
            case 4: return "用小方格铺满广场。";
            case 5: return "一半要回到自己的整体。";
            case 6: return "先列后层，找到(2,3)。";
            default: return "点亮第一层。";
        }
    }

    String rule() {
        switch (currentLevel) {
            case 0: return "一一对应：一步配一块。";
            case 1: return "位值制：10个一组成1个十。";
            case 2: return "旋转改变方向，端点接上路才通。";
            case 3: return "2行，每行3格，一共6格。";
            case 4: return "面积是铺满的单位格个数。";
            case 5: return "分数先看整体。";
            case 6: return "数对先找列，再找层。";
            default: return "";
        }
    }

    String conceptTags() {
        switch (currentLevel) {
            case 0: return "一上：一一对应 / 比较 / 剩余";
            case 1: return "一下：位值制 / 十位个位 / 数的组成";
            case 2: return "二上-三下：旋转 / 直角 / 端点接续";
            case 3: return "二上-三下：乘法阵列 / 几个几";
            case 4: return "三下：面积 / 单位密铺 / 乘法阵列";
            case 5: return "三下-五上：分数 / 部分-整体";
            case 6: return "四上：数对 / 列行 / 坐标";
            default: return "小学数学：数、运算、空间、度量、关系";
        }
    }

    int rank() {
        return 1 + cognition / 80;
    }

    int rankProgress() {
        return cognition % 80;
    }

    String guardianName() {
        switch (currentLevel) {
            case 0: return "缺口";
            case 1: return "散落的一";
            case 2: return "错向端点";
            case 3: return "散列平台";
            case 4: return "空洞";
            case 5: return "错位半圆";
            case 6: return "列行格";
            default: return "塔影";
        }
    }

    String powerName() {
        switch (currentLevel) {
            case 0: return "对应";
            case 1: return "捆扎";
            case 2: return "旋转";
            case 3: return "阵列";
            case 4: return "密铺";
            case 5: return "整体";
            case 6: return "列行";
            default: return "认知";
        }
    }

    int shieldMax() {
        switch (currentLevel) {
            case 0: return 3;
            case 1: return 10;
            case 2: return 4;
            case 3: return 6;
            case 4: return 12;
            case 5: return 2;
            case 6: return 6;
            default: return 1;
        }
    }

    int shieldProgress() {
        switch (currentLevel) {
            case 0: return stonesPlaced;
            case 1: return onesPlaced;
            case 2: return rotationStep == 1 ? 4 : 0;
            case 3: return arrayCols == 3 ? 6 : Math.min(arrayCols * 2, 6);
            case 4:
                int count = 0;
                for (boolean tile : areaTiles) {
                    if (tile) count += 1;
                }
                return count;
            case 5: return (smallHalfPlaced ? 1 : 0) + (bigHalfPlaced ? 1 : 0);
            case 6:
                int score = 0;
                if (coordCol == 2) score += 3;
                if (coordRow == 3) score += 3;
                return score;
            default: return 0;
        }
    }

    private static int reward(int level) {
        switch (level) {
            case 0: return 20;
            case 1: return 25;
            case 2: return 25;
            case 3: return 30;
            case 4: return 35;
            case 5: return 40;
            case 6: return 50;
            default: return 10;
        }
    }

    private String blockedText() {
        switch (currentLevel) {
            case 0: return "桥还少石头。";
            case 1: return "还没有凑够10个一。";
            case 2: return "端点没接上。";
            case 3: return arrayCols < 3 ? "桥短了。" : "桥太长了。";
            case 4: return "这里还空着。";
            case 5: return "两个半圆还没归位。";
            case 6: return "列和层还没对。";
            default: return "再观察一下。";
        }
    }

    private String hintText() {
        switch (currentLevel) {
            case 0: return "点石堆，把3个空位填满。";
            case 1: return "数到10，机器会把它捆成一个十。";
            case 2: return "蓝色圆环每次转90度。";
            case 3: return "目标是2行3列，不是算题。";
            case 4: return "不能留洞，也不能重叠。";
            case 5: return "小的一半配小圆，大的一半配大圆。";
            case 6: return "列按到2，层按到3。";
            default: return "选择一层开始。";
        }
    }

    private String coordText() {
        if (coordCol == 2 && coordRow == 3) return "第2列第3层，对了。";
        return "现在是第" + coordCol + "列第" + coordRow + "层。";
    }
}
