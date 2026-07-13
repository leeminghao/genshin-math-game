package com.mathisland.foldtower;

final class GameStateSmokeTest {
    public static void main(String[] args) {
        oneToOne();
        placeValue();
        rotation();
        array();
        area();
        fraction();
        coordinate();
        System.out.println("Fold Math Tower GameState smoke test passed");
    }

    private static void oneToOne() {
        GameState state = new GameState();
        state.startLevel(0);
        state.placeStone();
        state.placeStone();
        assertFalse(state.solved(), "two stones should not solve bridge");
        state.placeStone();
        assertTrue(state.solved(), "three stones should solve bridge");
        assertTrue(state.completed[0], "level 0 should auto complete when bridge is solved");
        assertTrue(state.cognition == 20, "auto completion should grant cognition");
        assertTrue(state.burstSerial == 1, "first clear should trigger burst");
        state.tryGoal();
        assertTrue(state.currentLevel == 1, "open door should move to place value level");
        assertTrue(state.cognition == 20, "moving next should not farm cognition");
    }

    private static void placeValue() {
        GameState state = new GameState();
        state.startLevel(1);
        for (int i = 0; i < 9; i += 1) state.placeOneBlock();
        assertFalse(state.solved(), "nine ones should not become one ten");
        state.placeOneBlock();
        assertTrue(state.solved(), "ten ones should become one ten");
        assertTrue(state.completed[1], "level 1 should auto complete");
        assertTrue(state.rule().contains("10个一"), "rule should explain place value");
        state.tryGoal();
        assertTrue(state.currentLevel == 2, "open door should move from place value to rotation");
    }

    private static void rotation() {
        GameState state = new GameState();
        state.startLevel(2);
        assertTrue(state.rotationDegrees() == 0, "rotation should start at 0 degrees");
        state.rotateTower();
        assertTrue(state.rotationDegrees() == 90, "one tap should rotate to 90 degrees");
        assertTrue(state.rotationIsRightAngle(), "90 degrees should be the right-angle state");
        assertTrue(state.solved(), "90 degree rotation should connect stair");
        assertTrue(state.completed[2], "level 2 should auto complete");
        state.tryGoal();
        assertTrue(state.currentLevel == 3, "open door should move from rotation to array");
    }

    private static void array() {
        GameState state = new GameState();
        state.startLevel(3);
        state.setArrayCols(2);
        assertFalse(state.solved(), "2 columns should be short");
        state.setArrayCols(3);
        assertTrue(state.solved(), "2x3 should solve array bridge");
    }

    private static void area() {
        GameState state = new GameState();
        state.startLevel(4);
        for (int i = 0; i < 11; i += 1) state.placeAreaTile(i);
        assertFalse(state.solved(), "one hole should remain unsolved");
        state.placeAreaTile(11);
        assertTrue(state.solved(), "all unit tiles should solve area");
    }

    private static void fraction() {
        GameState state = new GameState();
        state.startLevel(5);
        state.selectHalf("small");
        state.placeHalf("big");
        assertFalse(state.smallHalfPlaced, "wrong whole should reject half");
        state.selectHalf("small");
        state.placeHalf("small");
        state.selectHalf("big");
        state.placeHalf("big");
        assertTrue(state.solved(), "matching halves to wholes should solve fraction");
    }

    private static void coordinate() {
        GameState state = new GameState();
        state.startLevel(6);
        state.cycleCol();
        state.cycleRow();
        state.cycleRow();
        assertTrue(state.solved(), "(2,3) should solve coordinate level");
    }

    private static void assertTrue(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
    }

    private static void assertFalse(boolean condition, String message) {
        if (condition) throw new AssertionError(message);
    }
}
