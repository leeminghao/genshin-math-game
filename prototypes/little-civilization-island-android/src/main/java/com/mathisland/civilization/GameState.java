package com.mathisland.civilization;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

final class GameState {
    enum Zone {
        EAT,
        PLANT,
        BUILD,
        RECORD
    }

    static final class Resource {
        final String id;
        final String kind;
        final String label;
        final Zone targetZone;
        Zone zone;
        boolean carried;

        Resource(String id, String kind, String label, Zone targetZone) {
            this.id = id;
            this.kind = kind;
            this.label = label;
            this.targetZone = targetZone;
        }
    }

    final boolean[] countedResidents = new boolean[3];
    final boolean[] countedFood = new boolean[4];
    final boolean[] meals = new boolean[3];
    final List<Resource> resources = new ArrayList<>();
    final Set<String> fieldCells = new HashSet<>();
    final Set<String> granaryCells = new HashSet<>();
    final Set<String> records = new HashSet<>();
    final List<String> reactions = new ArrayList<>();

    int day = 1;
    int penalties = 0;
    int lastRejectedSerial = 0;
    String carriedResourceId = "";
    String fieldQuality = "";
    String feedback = "洪水退了。先看看人和粮。";
    String lastRejectedKind = "";
    Zone lastRejectedZone = null;

    GameState() {
        reset();
    }

    void reset() {
        Arrays.fill(countedResidents, false);
        Arrays.fill(countedFood, false);
        Arrays.fill(meals, false);
        resources.clear();
        addResource("food-1", "food", "谷", Zone.EAT);
        addResource("food-2", "food", "谷", Zone.EAT);
        addResource("food-3", "food", "谷", Zone.EAT);
        addResource("food-4", "food", "谷", Zone.EAT);
        addResource("seed-1", "seed", "种", Zone.PLANT);
        addResource("seed-2", "seed", "种", Zone.PLANT);
        addResource("wood-1", "wood", "木", Zone.BUILD);
        addResource("wood-2", "wood", "木", Zone.BUILD);
        addResource("wood-3", "wood", "木", Zone.BUILD);
        addResource("wood-4", "wood", "木", Zone.BUILD);
        addResource("stone-1", "stone", "石", Zone.BUILD);
        addResource("stone-2", "stone", "石", Zone.BUILD);
        addResource("stone-3", "stone", "石", Zone.BUILD);
        addResource("clay-1", "clay", "泥", Zone.RECORD);
        fieldCells.clear();
        granaryCells.clear();
        records.clear();
        reactions.clear();
        day = 1;
        penalties = 0;
        lastRejectedSerial = 0;
        carriedResourceId = "";
        fieldQuality = "";
        lastRejectedKind = "";
        lastRejectedZone = null;
        feedback = "洪水退了。先看看人和粮。";
    }

    void inspectCampfire() {
        if (!countingDone()) {
            feedback = "大家还不知道饭够不够。先数清楚。";
        } else if (!classificationDone()) {
            feedback = "东西乱成一堆。先分开放。";
        } else if (!mealsDone()) {
            feedback = "饭碗摆好了。别让任何人空着。";
        } else if (!fieldDone()) {
            feedback = "田埂被冲坏了。去量一块 6 格田。";
        } else if (!granaryDone()) {
            feedback = "旧仓漏粮。给新仓摆稳地基。";
        } else if (!recordDone()) {
            feedback = "今天做成的事，要刻下来。";
        } else {
            feedback = "第二天，营地没有忘。远处有新地方。";
        }
    }

    void countResident(int index) {
        if (index < 0 || index >= countedResidents.length) return;
        countedResidents[index] = true;
        updateCountingFeedback();
    }

    void countFood(int index) {
        if (index < 0 || index >= countedFood.length) return;
        countedFood[index] = true;
        updateCountingFeedback();
    }

    void pickResource(String id) {
        if (!countingDone()) {
            feedback = "先数人和粮。别急着搬东西。";
            return;
        }
        Resource resource = resourceById(id);
        if (resource == null || resource.zone != null) return;
        Resource carried = carriedResource();
        if (carried != null) {
            feedback = "手里有东西了。先找个合适的地方放。";
            return;
        }
        resource.carried = true;
        carriedResourceId = id;
        feedback = "拿起来了。它应该去哪儿？";
    }

    void depositCarried(Zone zone) {
        Resource resource = carriedResource();
        if (resource == null) {
            feedback = "先捡起一个东西。";
            return;
        }

        if (resource.targetZone != zone) {
            penalties += 1;
            lastRejectedSerial += 1;
            lastRejectedKind = resource.kind;
            lastRejectedZone = zone;
            addReaction("异类弹回");
            resource.carried = false;
            carriedResourceId = "";
            feedback = penaltyText(resource, zone);
            return;
        }

        resource.zone = zone;
        resource.carried = false;
        carriedResourceId = "";
        if ("wood".equals(resource.kind) && countResources("wood", Zone.BUILD) >= 2) {
            addReaction("同类合并");
        }
        feedback = successText(resource);
        if (classificationDone()) {
            feedback = "东西分清了。该分饭了。";
        }
    }

    void feedResident(int index) {
        if (!classificationDone()) {
            feedback = "饭还没整理好。先把谷物放好。";
            return;
        }
        if (index < 0 || index >= meals.length) return;
        if (meals[index]) {
            feedback = "他已经有饭了。看看谁还空着。";
            return;
        }
        int mealsGiven = countTrue(meals);
        int foodReady = countResources("food", Zone.EAT);
        if (mealsGiven >= foodReady) {
            penalties += 1;
            feedback = "饭不够了。要先数清楚。";
            return;
        }
        meals[index] = true;
        if (mealsDone()) {
            addReaction("公平饭桌");
            feedback = "每个人都有饭。小禾去看田了。";
        } else {
            feedback = "一人一份。还有谁没吃到？";
        }
    }

    void toggleFieldCell(int row, int col) {
        if (!mealsDone()) {
            feedback = "大家还饿着。先公平分饭。";
            return;
        }
        toggleCell(fieldCells, row, col);
        if (fieldCells.size() < 6) {
            feedback = "圈了 " + fieldCells.size() + " 格，还不够。";
            return;
        }
        if (fieldCells.size() > 6 || !isSolidRectangle(fieldCells, 6)) {
            penalties += 1;
            fieldCells.clear();
            feedback = "田埂断了，水会漏。重来。";
            return;
        }
        RectShape shape = shapeOf(fieldCells);
        boolean standard = (shape.rows == 2 && shape.cols == 3) || (shape.rows == 3 && shape.cols == 2);
        boolean longField = (shape.rows == 1 && shape.cols == 6) || (shape.rows == 6 && shape.cols == 1);
        if (!standard && !longField) {
            penalties += 1;
            fieldCells.clear();
            feedback = "这块田不好照料。换个形状。";
            return;
        }
        fieldQuality = longField ? "low" : "standard";
        addReaction(longField ? "长形低效" : "阵列发芽");
        feedback = longField ? "也是 6 格，但太长了，明天少收。" : "6 格田稳了，种子发芽。";
    }

    void toggleGranaryCell(int row, int col) {
        if (!fieldDone()) {
            feedback = "先把田量好，再修粮仓。";
            return;
        }
        toggleCell(granaryCells, row, col);
        if (granaryCells.size() < 4) {
            feedback = "地基摆了 " + granaryCells.size() + " 格，还不稳。";
            return;
        }
        if (granaryCells.size() > 4 || !isSolidRectangle(granaryCells, 4)) {
            penalties += 1;
            granaryCells.clear();
            feedback = "地基歪了，仓会倒。";
            return;
        }
        RectShape shape = shapeOf(granaryCells);
        if (shape.rows != 2 || shape.cols != 2) {
            penalties += 1;
            granaryCells.clear();
            feedback = "4 格不一定稳。试试方方正正。";
            return;
        }
        feedback = "粮仓站稳了。泥婆在等你刻泥板。";
    }

    void carveRecord(String key) {
        if (!granaryDone()) {
            feedback = "先把田和粮仓做好，再记录。";
            return;
        }
        if (!("people".equals(key) || "food".equals(key) || "field".equals(key) || "granary".equals(key))) return;
        records.add(key);
        if (recordDone()) {
            addReaction("记忆延续");
            day = 2;
            feedback = "泥板记住了。第二天不用重来。";
        } else {
            feedback = "刻下 " + records.size() + "/4 件事。";
        }
    }

    boolean countingDone() {
        return countTrue(countedResidents) == countedResidents.length && countTrue(countedFood) == countedFood.length;
    }

    boolean classificationDone() {
        for (Resource resource : resources) {
            if (resource.zone == null) return false;
        }
        return true;
    }

    boolean mealsDone() {
        return countTrue(meals) == meals.length;
    }

    boolean fieldDone() {
        return fieldCells.size() == 6 && isSolidRectangle(fieldCells, 6) && fieldQuality.length() > 0;
    }

    boolean granaryDone() {
        return granaryCells.size() == 4 && isSolidRectangle(granaryCells, 4);
    }

    boolean recordDone() {
        return records.contains("people") && records.contains("food") && records.contains("field") && records.contains("granary");
    }

    Resource carriedResource() {
        if (carriedResourceId.length() == 0) return null;
        return resourceById(carriedResourceId);
    }

    int countResources(String kind, Zone zone) {
        int count = 0;
        for (Resource resource : resources) {
            if (kind.equals(resource.kind) && resource.zone == zone) count += 1;
        }
        return count;
    }

    private void addResource(String id, String kind, String label, Zone targetZone) {
        resources.add(new Resource(id, kind, label, targetZone));
    }

    private Resource resourceById(String id) {
        for (Resource resource : resources) {
            if (resource.id.equals(id)) return resource;
        }
        return null;
    }

    private void updateCountingFeedback() {
        if (countingDone()) {
            feedback = "现在知道了：3 个居民，4 份粮。多出的 1 份要好好存起来。";
        } else {
            feedback = "石子越放越清楚：一个东西对应一个记号。";
        }
    }

    private void addReaction(String name) {
        if (!reactions.contains(name)) reactions.add(name);
    }

    private static void toggleCell(Set<String> cells, int row, int col) {
        String id = row + ":" + col;
        if (cells.contains(id)) {
            cells.remove(id);
        } else {
            cells.add(id);
        }
    }

    private static int countTrue(boolean[] values) {
        int count = 0;
        for (boolean value : values) {
            if (value) count += 1;
        }
        return count;
    }

    private static String penaltyText(Resource resource, Zone zone) {
        if ("food".equals(resource.kind) && zone != Zone.EAT) return "谷物放错会坏，今晚没饭。";
        if ("seed".equals(resource.kind) && zone != Zone.PLANT) return "种子乱用，明天没田。";
        if (("wood".equals(resource.kind) || "stone".equals(resource.kind)) && zone != Zone.BUILD) return "木头石头不能吃。";
        if ("clay".equals(resource.kind) && zone != Zone.RECORD) return "泥要留着刻事。";
        return "这里用不上它。";
    }

    private static String successText(Resource resource) {
        if ("food".equals(resource.kind)) return "谷物收好了，可以分饭。";
        if ("seed".equals(resource.kind)) return "种子留下，明天会长。";
        if ("wood".equals(resource.kind)) return "木头能修仓。";
        if ("stone".equals(resource.kind)) return "石头能压稳。";
        if ("clay".equals(resource.kind)) return "泥能刻下今天。";
        return "放对地方了。";
    }

    static boolean isSolidRectangle(Set<String> cells, int area) {
        RectShape shape = shapeOf(cells);
        if (shape.area != area || cells.size() != area) return false;
        for (int row : shape.rowValues) {
            for (int col : shape.colValues) {
                if (!cells.contains(row + ":" + col)) return false;
            }
        }
        return true;
    }

    private static RectShape shapeOf(Set<String> cells) {
        Set<Integer> rows = new HashSet<>();
        Set<Integer> cols = new HashSet<>();
        for (String cell : cells) {
            String[] parts = cell.split(":");
            rows.add(Integer.parseInt(parts[0]));
            cols.add(Integer.parseInt(parts[1]));
        }
        return new RectShape(rows, cols);
    }

    private static final class RectShape {
        final int rows;
        final int cols;
        final int area;
        final int[] rowValues;
        final int[] colValues;

        RectShape(Set<Integer> rowSet, Set<Integer> colSet) {
            rows = rowSet.size();
            cols = colSet.size();
            area = rows * cols;
            rowValues = toArray(rowSet);
            colValues = toArray(colSet);
        }

        private static int[] toArray(Set<Integer> values) {
            int[] result = new int[values.size()];
            int index = 0;
            for (int value : values) {
                result[index] = value;
                index += 1;
            }
            Arrays.sort(result);
            return result;
        }
    }
}
