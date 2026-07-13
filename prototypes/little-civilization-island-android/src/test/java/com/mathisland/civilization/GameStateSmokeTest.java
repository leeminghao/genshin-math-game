package com.mathisland.civilization;

final class GameStateSmokeTest {
    public static void main(String[] args) {
        wrongClassificationLeavesConsequence();
        fullCivilizationLoop();
        System.out.println("Open-world GameState smoke test passed");
    }

    private static void wrongClassificationLeavesConsequence() {
        GameState state = new GameState();

        for (int i = 0; i < 3; i += 1) state.countResident(i);
        for (int i = 0; i < 4; i += 1) state.countFood(i);
        assertTrue(state.countingDone(), "counting should be complete");

        state.pickResource("food-1");
        state.depositCarried(GameState.Zone.BUILD);
        assertTrue(state.penalties == 1, "wrong classification should add penalty");
        assertTrue(state.lastRejectedSerial == 1, "wrong classification should be visible to the view");
        assertTrue("food".equals(state.lastRejectedKind), "wrong classification should remember resource kind");
        assertTrue(state.lastRejectedZone == GameState.Zone.BUILD, "wrong classification should remember rejected zone");
        assertTrue(state.carriedResource() == null, "wrong resource should return to the ground");
        assertTrue(state.countResources("food", GameState.Zone.EAT) == 0, "wrong resource should not be counted as stored");
        assertTrue(!state.classificationDone(), "wrong classification should not progress the task");

        state.pickResource("food-1");
        state.depositCarried(GameState.Zone.EAT);
        assertTrue(state.countResources("food", GameState.Zone.EAT) == 1, "resource should still be recoverable");
    }

    private static void fullCivilizationLoop() {
        GameState state = new GameState();

        for (int i = 0; i < 3; i += 1) state.countResident(i);
        for (int i = 0; i < 4; i += 1) state.countFood(i);
        assertTrue(state.countingDone(), "counting should be complete");

        for (GameState.Resource resource : state.resources) {
            state.pickResource(resource.id);
            state.depositCarried(resource.targetZone);
        }
        assertTrue(state.classificationDone(), "classification should be complete");
        assertContains(state, "同类合并");

        for (int i = 0; i < 3; i += 1) state.feedResident(i);
        assertTrue(state.mealsDone(), "fair meal should be complete");
        assertContains(state, "公平饭桌");

        int[][] field = { { 0, 0 }, { 0, 1 }, { 0, 2 }, { 1, 0 }, { 1, 1 }, { 1, 2 } };
        for (int[] cell : field) state.toggleFieldCell(cell[0], cell[1]);
        assertTrue(state.fieldDone(), "2x3 field should be accepted");
        assertContains(state, "阵列发芽");

        int[][] granary = { { 0, 0 }, { 0, 1 }, { 1, 0 }, { 1, 1 } };
        for (int[] cell : granary) state.toggleGranaryCell(cell[0], cell[1]);
        assertTrue(state.granaryDone(), "2x2 granary should be accepted");

        state.carveRecord("people");
        state.carveRecord("food");
        state.carveRecord("field");
        state.carveRecord("granary");
        assertTrue(state.recordDone(), "records should complete the day");
        assertContains(state, "记忆延续");
    }

    private static void assertTrue(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
    }

    private static void assertContains(GameState state, String reaction) {
        if (!state.reactions.contains(reaction)) {
            throw new AssertionError("missing reaction " + reaction + " in " + state.reactions);
        }
    }
}
