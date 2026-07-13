package com.mathisland.foldtower;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.os.SystemClock;
import android.view.MotionEvent;
import android.view.View;

import java.util.ArrayList;
import java.util.List;

final class FoldMathTowerView extends View {
    private final GameState state = new GameState();
    private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final List<Target> targets = new ArrayList<>();

    private float screenW;
    private float screenH;
    private boolean draggingArray = false;
    private boolean walkingToDoor = false;
    private long walkStartMs = 0L;
    private float walkStartX = 0f;
    private float walkStartY = 0f;
    private float walkEndX = 0f;
    private float walkEndY = 0f;
    private float lastAvatarX = 0f;
    private float lastAvatarY = 0f;

    private static final long WALK_DURATION_MS = 720L;

    private final int bgTop = Color.rgb(190, 223, 229);
    private final int bgBottom = Color.rgb(247, 228, 184);
    private final int ink = Color.rgb(35, 44, 52);
    private final int muted = Color.rgb(99, 109, 118);
    private final int panel = Color.rgb(255, 250, 234);
    private final int panelLine = Color.rgb(205, 188, 150);
    private final int gold = Color.rgb(224, 167, 65);
    private final int blue = Color.rgb(75, 139, 214);
    private final int green = Color.rgb(82, 156, 115);
    private final int purple = Color.rgb(143, 112, 202);
    private final int coral = Color.rgb(222, 111, 88);
    private final int dark = Color.rgb(42, 45, 65);
    private final int energy = Color.rgb(116, 215, 230);
    private final int stone = Color.rgb(194, 182, 160);
    private final int stoneTop = Color.rgb(235, 224, 198);
    private final int stoneLeft = Color.rgb(185, 168, 139);
    private final int stoneRight = Color.rgb(154, 139, 116);
    private final int pathTop = Color.rgb(248, 241, 214);
    private final int pathActive = Color.rgb(255, 232, 159);
    private final int shadow = Color.argb(36, 35, 44, 52);

    FoldMathTowerView(Context context) {
        super(context);
        setFocusable(true);
        setBackgroundColor(bgBottom);
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        float density = getResources().getDisplayMetrics().density;
        screenW = getWidth() / density;
        screenH = getHeight() / density;
        targets.clear();

        canvas.save();
        canvas.scale(density, density);
        updateDoorTransition();
        drawBackground(canvas);
        if (state.currentLevel < 0) {
            drawHome(canvas);
        } else {
            drawLevel(canvas);
        }
        drawFeedback(canvas);
        canvas.restore();
        postInvalidateOnAnimation();
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        float density = getResources().getDisplayMetrics().density;
        float x = event.getX() / density;
        float y = event.getY() / density;
        int action = event.getActionMasked();

        if (action == MotionEvent.ACTION_DOWN) {
            if (walkingToDoor) return true;
            Target target = hitTarget(x, y);
            if (target != null) {
                if ("array".equals(target.type)) {
                    draggingArray = true;
                    updateArrayFromX(x);
                    invalidate();
                    return true;
                }
                handleTarget(target);
                invalidate();
                return true;
            }
        } else if (action == MotionEvent.ACTION_MOVE) {
            if (draggingArray) {
                updateArrayFromX(x);
                invalidate();
                return true;
            }
        } else if (action == MotionEvent.ACTION_UP || action == MotionEvent.ACTION_CANCEL) {
            draggingArray = false;
        }
        return true;
    }

    private void handleTarget(Target target) {
        if ("level".equals(target.type)) {
            state.startLevel(Integer.parseInt(target.id));
            return;
        }
        if ("back".equals(target.type)) {
            state.goHome();
            return;
        }
        if ("hint".equals(target.type)) {
            state.hint();
            return;
        }
        if ("next".equals(target.type)) {
            state.nextLevel();
            return;
        }
        if ("goal".equals(target.type)) {
            handleGoal(target);
            return;
        }
        if ("stone".equals(target.type)) {
            state.placeStone();
            return;
        }
        if ("oneBlock".equals(target.type)) {
            state.placeOneBlock();
            return;
        }
        if ("rotate".equals(target.type)) {
            state.rotateTower();
            return;
        }
        if ("cell".equals(target.type)) {
            state.placeAreaTile(Integer.parseInt(target.id));
            return;
        }
        if ("smallHalf".equals(target.type)) {
            state.selectHalf("small");
            return;
        }
        if ("bigHalf".equals(target.type)) {
            state.selectHalf("big");
            return;
        }
        if ("smallDoor".equals(target.type)) {
            state.placeHalf("small");
            return;
        }
        if ("bigDoor".equals(target.type)) {
            state.placeHalf("big");
            return;
        }
        if ("col".equals(target.type)) {
            state.cycleCol();
            return;
        }
        if ("row".equals(target.type)) {
            state.cycleRow();
        }
    }

    private void updateArrayFromX(float x) {
        float start = screenW / 2f - 92;
        int cols = Math.round((x - start) / 62f) + 1;
        state.setArrayCols(cols);
    }

    private void handleGoal(Target target) {
        if (state.currentLevel < 0) return;
        if (!state.completed[state.currentLevel]) {
            state.tryGoal();
            return;
        }
        beginDoorWalk(target.actionX, target.actionY + 18);
    }

    private void beginDoorWalk(float x, float y) {
        walkingToDoor = true;
        walkStartMs = SystemClock.uptimeMillis();
        walkStartX = lastAvatarX;
        walkStartY = lastAvatarY;
        walkEndX = x;
        walkEndY = y;
    }

    private void updateDoorTransition() {
        if (!walkingToDoor) return;
        long elapsed = SystemClock.uptimeMillis() - walkStartMs;
        if (elapsed >= WALK_DURATION_MS) {
            walkingToDoor = false;
            state.nextLevel();
        }
    }

    private void drawBackground(Canvas canvas) {
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(bgTop);
        canvas.drawRect(0, 0, screenW, screenH * 0.45f, paint);
        paint.setColor(bgBottom);
        canvas.drawRect(0, screenH * 0.45f, screenW, screenH, paint);

        Path far = new Path();
        far.moveTo(0, screenH * 0.43f);
        far.lineTo(screenW * 0.24f, screenH * 0.31f);
        far.lineTo(screenW * 0.48f, screenH * 0.43f);
        far.lineTo(screenW * 0.68f, screenH * 0.33f);
        far.lineTo(screenW, screenH * 0.44f);
        far.lineTo(screenW, screenH * 0.52f);
        far.lineTo(0, screenH * 0.52f);
        far.close();
        paint.setColor(Color.rgb(156, 190, 190));
        canvas.drawPath(far, paint);

        paint.setColor(Color.rgb(231, 211, 170));
        canvas.drawRect(0, screenH * 0.52f, screenW, screenH, paint);

        paint.setColor(Color.argb(32, 35, 44, 52));
        canvas.drawOval(new RectF(screenW * 0.08f, screenH * 0.76f, screenW * 0.92f, screenH * 0.92f), paint);
    }

    private void drawHome(Canvas canvas) {
        drawText(canvas, "折折数学塔", screenW / 2f, 62, 28, ink, true, Paint.Align.CENTER);
        drawText(canvas, "转动建筑，让路自己成立。", screenW / 2f, 89, 12, muted, false, Paint.Align.CENTER);
        drawPlayerHud(canvas, 38, 108, screenW - 76);

        float centerX = screenW / 2f;
        float topY = 162;
        float step = Math.min(66, Math.max(52, (screenH - topY - 86) / Math.max(1, GameState.LEVEL_COUNT - 1)));
        for (int i = 0; i < GameState.LEVEL_COUNT; i += 1) {
            float y = topY + i * step;
            float x = centerX + (i % 2 == 0 ? -38 : 38);
            if (i > 0) {
                paint.setStyle(Paint.Style.STROKE);
                paint.setStrokeWidth(5);
                paint.setStrokeCap(Paint.Cap.ROUND);
                paint.setColor(Color.rgb(147, 151, 130));
                canvas.drawLine(centerX + (i % 2 == 0 ? 38 : -38), y - step + 16, x, y - 18, paint);
                paint.setStrokeCap(Paint.Cap.BUTT);
                paint.setStyle(Paint.Style.FILL);
            }
            boolean done = state.completed[i];
            drawIsoBlock(canvas, x, y, 118, 58, 20,
                    done ? Color.rgb(255, 232, 159) : pathTop,
                    done ? Color.rgb(205, 169, 93) : stoneLeft,
                    done ? Color.rgb(171, 132, 65) : stoneRight);
            drawText(canvas, String.valueOf(i + 1), x - 34, y + 6, 18, ink, true, Paint.Align.CENTER);
            drawText(canvas, levelTag(i), x + 13, y + 6, 13, done ? green : muted, true, Paint.Align.CENTER);
            addTarget("level", String.valueOf(i), x - 68, y - 44, 136, 86);
        }

        drawText(canvas, "点一块浮台开始", screenW / 2f, screenH - 42, 13, muted, true, Paint.Align.CENTER);
    }

    private int firstOpenLevel() {
        for (int i = 0; i < GameState.LEVEL_COUNT; i += 1) {
            if (!state.completed[i]) return i;
        }
        return GameState.LEVEL_COUNT - 1;
    }

    private String levelTag(int level) {
        switch (level) {
            case 0: return "对应";
            case 1: return "位值";
            case 2: return "旋转";
            case 3: return "阵列";
            case 4: return "面积";
            case 5: return "分数";
            case 6: return "坐标";
            default: return "";
        }
    }

    private void drawLevel(Canvas canvas) {
        drawLevelHud(canvas);
        switch (state.currentLevel) {
            case 0:
                drawOneToOne(canvas);
                break;
            case 1:
                drawPlaceValue(canvas);
                break;
            case 2:
                drawRotation(canvas);
                break;
            case 3:
                drawArray(canvas);
                break;
            case 4:
                drawArea(canvas);
                break;
            case 5:
                drawFraction(canvas);
                break;
            case 6:
                drawCoordinate(canvas);
                break;
            default:
                break;
        }
        drawConceptBar(canvas);
    }

    private void drawLevelHud(Canvas canvas) {
        roundRect(canvas, 20, 24, 30, 30, 15, panel, panelLine);
        drawText(canvas, "‹", 35, 45, 21, ink, true, Paint.Align.CENTER);
        addTarget("back", "", 14, 18, 44, 44);

        roundRect(canvas, screenW - 50, 24, 30, 30, 15, panel, panelLine);
        drawText(canvas, "?", screenW - 35, 43, 14, ink, true, Paint.Align.CENTER);
        addTarget("hint", "", screenW - 58, 18, 44, 44);

        drawText(canvas, state.title(), screenW / 2f, 41, 15, ink, true, Paint.Align.CENTER);
        drawLevelPips(canvas, screenW / 2f, 60);
    }

    private void drawPlayerHud(Canvas canvas, float x, float y, float width) {
        float height = 24;
        roundRect(canvas, x, y, width, height, 12, panel, panelLine);
        drawText(canvas, "Lv." + state.rank(), x + 14, y + 17, 11, ink, true, Paint.Align.LEFT);
        float barX = x + 46;
        float barW = Math.max(44, width - 72);
        roundRect(canvas, barX, y + 8, barW, 8, 4, Color.rgb(201, 190, 166), 0);
        float progress = Math.min(1f, state.rankProgress() / 80f);
        roundRect(canvas, barX, y + 8, barW * progress, 8, 4, energy, 0);
        drawText(canvas, state.cognition + "", x + width - 10, y + 17, 10, muted, true, Paint.Align.RIGHT);
    }

    private void drawLevelPips(Canvas canvas, float cx, float y) {
        float start = cx - (GameState.LEVEL_COUNT - 1) * 8;
        for (int i = 0; i < GameState.LEVEL_COUNT; i += 1) {
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(i == state.currentLevel ? gold : state.completed[i] ? green : Color.rgb(181, 170, 148));
            canvas.drawCircle(start + i * 16, y, i == state.currentLevel ? 5 : 3, paint);
        }
    }

    private void drawOneToOne(Canvas canvas) {
        float y = screenH * 0.42f;
        float cx = screenW / 2f;
        drawAvatar(canvas, cx - 142, y + 20);
        drawGoal(canvas, cx + 146, y - 2, state.solved());

        drawIsoBlock(canvas, cx - 122, y, 82, 46, 24, stoneTop, stoneLeft, stoneRight);
        drawIsoBlock(canvas, cx + 124, y, 82, 46, 24, stoneTop, stoneLeft, stoneRight);
        for (int i = 0; i < 3; i += 1) {
            float x = cx - 52 + i * 52;
            boolean filled = i < state.stonesPlaced;
            drawIsoBlock(canvas, x, y, 44, 26, filled ? 18 : 10,
                    filled ? pathActive : Color.rgb(228, 218, 195),
                    filled ? Color.rgb(202, 158, 74) : Color.rgb(173, 158, 132),
                    filled ? Color.rgb(167, 126, 58) : Color.rgb(146, 132, 111));
            if (!filled) {
                paint.setStyle(Paint.Style.STROKE);
                paint.setStrokeWidth(2);
                paint.setColor(Color.rgb(170, 147, 114));
                canvas.drawCircle(x, y - 2, 8, paint);
                paint.setStyle(Paint.Style.FILL);
            }
            addTarget("stone", "", x - 26, y - 22, 52, 44);
        }

        float heapX = cx - 96;
        float heapY = y + 116;
        for (int i = 0; i < 4; i += 1) {
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(i < 3 - state.stonesPlaced ? stone : Color.argb(115, 194, 182, 160));
            canvas.drawOval(new RectF(heapX + i * 24, heapY - 14, heapX + i * 24 + 26, heapY + 12), paint);
        }
        drawHandle(canvas, heapX + 58, heapY + 38, state.stonesPlaced < 3 ? "+" : "·", gold);
        addTarget("stone", "", heapX - 16, heapY - 24, 150, 82);
        addGoalTarget(cx + 146, y - 2);
    }

    private void drawPlaceValue(Canvas canvas) {
        float cx = screenW / 2f;
        float y = screenH * 0.34f;
        drawAvatar(canvas, cx - 148, y + 72);
        drawGoal(canvas, cx + 148, y + 52, state.solved());

        drawIsoBlock(canvas, cx, y + 46, 220, 132, 34,
                state.solved() ? Color.rgb(221, 239, 207) : Color.rgb(238, 226, 199),
                state.solved() ? Color.rgb(139, 181, 116) : Color.rgb(171, 154, 126),
                state.solved() ? Color.rgb(102, 147, 94) : Color.rgb(139, 124, 105));
        drawText(canvas, "捆扎机", cx, y - 34, 13, ink, true, Paint.Align.CENTER);

        float cell = 24;
        float startX = cx - 48;
        float startY = y - 10;
        for (int i = 0; i < 10; i += 1) {
            int col = i % 5;
            int row = i / 5;
            float x = startX + col * cell;
            float yy = startY + row * 34;
            boolean filled = i < state.onesPlaced;
            drawDiamond(canvas, x, yy, 22, 16,
                    filled ? Color.rgb(255, 232, 159) : Color.rgb(230, 220, 198), true);
        }

        if (state.solved()) {
            roundRect(canvas, cx - 17, y + 66, 34, 72, 8,
                    Color.rgb(255, 232, 159), Color.rgb(205, 169, 93));
            drawText(canvas, "1个十", cx, y + 108, 11, ink, true, Paint.Align.CENTER);
        } else {
            drawText(canvas, state.onesPlaced + "/10", cx, y + 108, 18, ink, true, Paint.Align.CENTER);
        }

        float heapY = screenH - 202;
        for (int i = 0; i < 10; i += 1) {
            float x = cx - 108 + (i % 5) * 24;
            float yy = heapY + (i / 5) * 26;
            boolean left = i >= state.onesPlaced;
            drawDiamond(canvas, x, yy, 20, 15,
                    left ? Color.rgb(244, 221, 173) : Color.argb(90, 244, 221, 173), true);
        }
        drawHandle(canvas, cx + 84, heapY + 16, "+1", gold);
        addTarget("oneBlock", "", cx - 130, heapY - 34, 250, 92);
        addGoalTarget(cx + 148, y + 52);
    }

    private void drawRotation(Canvas canvas) {
        float cx = screenW / 2f;
        float pivotX = cx;
        float pivotY = screenH * 0.47f;
        float length = 112;
        float lowerY = pivotY;
        float upperY = pivotY - length;

        drawAvatar(canvas, cx - 146, lowerY + 18);
        drawGoal(canvas, pivotX, upperY - 34, state.solved());
        drawIsoBlock(canvas, cx - 126, lowerY, 88, 48, 24, stoneTop, stoneLeft, stoneRight);
        drawIsoBlock(canvas, pivotX, upperY, 88, 48, 24,
                state.solved() ? Color.rgb(221, 239, 207) : stoneTop,
                state.solved() ? Color.rgb(139, 181, 116) : stoneLeft,
                state.solved() ? Color.rgb(102, 147, 94) : stoneRight);

        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(12);
        paint.setStrokeCap(Paint.Cap.ROUND);
        paint.setColor(Color.rgb(172, 151, 121));
        canvas.drawLine(cx - 88, lowerY, pivotX, pivotY, paint);

        float endX = pivotX;
        float endY = pivotY;
        if (state.rotationStep == 0) {
            endX = pivotX + length;
        } else if (state.rotationStep == 1) {
            endY = pivotY - length;
        } else if (state.rotationStep == 2) {
            endX = pivotX - length;
        } else {
            endY = pivotY + length;
        }
        paint.setColor(state.rotationIsRightAngle() ? green : Color.rgb(186, 170, 140));
        canvas.drawLine(pivotX, pivotY, endX, endY, paint);
        paint.setStrokeCap(Paint.Cap.BUTT);

        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(6);
        paint.setColor(blue);
        canvas.drawCircle(pivotX, pivotY, 58, paint);
        paint.setStrokeWidth(2);
        paint.setColor(Color.rgb(92, 115, 139));
        canvas.drawLine(pivotX - 8, pivotY - 58, pivotX + 8, pivotY - 58, paint);
        canvas.drawLine(pivotX + 58, pivotY - 8, pivotX + 58, pivotY + 8, paint);
        canvas.drawLine(pivotX - 8, pivotY + 58, pivotX + 8, pivotY + 58, paint);
        canvas.drawLine(pivotX - 58, pivotY - 8, pivotX - 58, pivotY + 8, paint);
        paint.setStyle(Paint.Style.FILL);

        if (state.rotationIsRightAngle()) {
            drawRightAngleMarker(canvas, pivotX, pivotY);
        }
        drawHandle(canvas, pivotX, pivotY, state.rotationDegrees() + "°", blue);
        addTarget("rotate", "", pivotX - 74, pivotY - 74, 148, 148);
        addGoalTarget(pivotX, upperY - 34);
    }

    private void drawArray(Canvas canvas) {
        float cx = screenW / 2f;
        float y = screenH * 0.36f;
        drawIsoBlock(canvas, cx, y + 24, 236, 124, 30,
                Color.rgb(151, 196, 203),
                Color.rgb(98, 139, 149),
                Color.rgb(75, 112, 126));

        float cell = 40;
        float startX = cx - state.arrayCols * cell / 2f + cell / 2f;
        for (int row = 0; row < 2; row += 1) {
            for (int col = 0; col < state.arrayCols; col += 1) {
                drawDiamond(canvas, startX + col * cell, y + row * 46, 38, 23,
                        state.arrayCols == 3 ? Color.rgb(255, 232, 159) : Color.rgb(243, 238, 218), true);
            }
        }
        drawText(canvas, "2 × " + state.arrayCols, cx, y + 126, 18, ink, true, Paint.Align.CENTER);

        float trackY = screenH - 202;
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(7);
        paint.setStrokeCap(Paint.Cap.ROUND);
        paint.setColor(Color.rgb(174, 151, 111));
        canvas.drawLine(cx - 92, trackY, cx + 92, trackY, paint);
        paint.setStrokeCap(Paint.Cap.BUTT);
        paint.setStyle(Paint.Style.FILL);
        float handleX = cx - 92 + (state.arrayCols - 1) * 62;
        drawHandle(canvas, handleX, trackY, "↔", gold);
        addTarget("array", "", cx - 118, trackY - 38, 236, 76);
        drawAvatar(canvas, cx - 142, y + 55);
        drawGoal(canvas, cx + 142, y + 40, state.solved());
        addGoalTarget(cx + 142, y + 40);
    }

    private void drawArea(Canvas canvas) {
        float cx = screenW / 2f;
        float y = screenH * 0.25f;
        int cols = 4;
        int rows = 3;
        float cell = 48;
        drawIsoBlock(canvas, cx, y + 54, 222, 150, 32,
                Color.rgb(203, 194, 171),
                Color.rgb(154, 137, 112),
                Color.rgb(122, 110, 94));
        float startX = cx - cols * cell / 2f + cell / 2f;
        for (int row = 0; row < rows; row += 1) {
            for (int col = 0; col < cols; col += 1) {
                int index = row * cols + col;
                float x = startX + col * cell;
                float yy = y + row * 50;
                drawDiamond(canvas, x, yy, 43, 26, state.areaTiles[index] ? gold : Color.rgb(244, 239, 220), true);
                if (!state.areaTiles[index]) {
                    paint.setStyle(Paint.Style.STROKE);
                    paint.setStrokeWidth(2);
                    paint.setColor(Color.rgb(170, 147, 114));
                    canvas.drawLine(x - 8, yy, x + 8, yy, paint);
                    canvas.drawLine(x, yy - 6, x, yy + 6, paint);
                    paint.setStyle(Paint.Style.FILL);
                }
                addTarget("cell", String.valueOf(index), x - 24, yy - 22, 48, 44);
            }
        }
        drawText(canvas, placedAreaTiles() + "/12", cx, y + 178, 18, ink, true, Paint.Align.CENTER);
        drawAvatar(canvas, cx - 132, y + 144);
        drawGoal(canvas, cx + 132, y + 136, state.solved());
        addGoalTarget(cx + 132, y + 136);
    }

    private int placedAreaTiles() {
        int count = 0;
        for (boolean tile : state.areaTiles) {
            if (tile) count += 1;
        }
        return count;
    }

    private void drawFraction(Canvas canvas) {
        float cx = screenW / 2f;
        float y = screenH * 0.29f;
        drawIsoBlock(canvas, cx - 86, y + 18, 120, 72, 24, stoneTop, stoneLeft, stoneRight);
        drawIsoBlock(canvas, cx + 92, y + 18, 140, 82, 24, stoneTop, stoneLeft, stoneRight);
        drawFractionDoor(canvas, cx - 86, y, 44, state.smallHalfPlaced, "小圆");
        drawFractionDoor(canvas, cx + 92, y, 66, state.bigHalfPlaced, "大圆");
        addTarget("smallDoor", "", cx - 140, y - 70, 108, 128);
        addTarget("bigDoor", "", cx + 22, y - 88, 140, 156);

        drawHalfPiece(canvas, cx - 72, y + 164, 44, "1/2", "small".equals(state.selectedHalf));
        drawHalfPiece(canvas, cx + 80, y + 164, 66, "1/2", "big".equals(state.selectedHalf));
        addTarget("smallHalf", "", cx - 120, y + 110, 96, 96);
        addTarget("bigHalf", "", cx + 16, y + 96, 132, 120);

        drawAvatar(canvas, cx - 150, y + 42);
        drawGoal(canvas, cx + 164, y + 42, state.solved());
        addGoalTarget(cx + 164, y + 42);
    }

    private void drawCoordinate(Canvas canvas) {
        float cx = screenW / 2f;
        float top = screenH * 0.22f;
        float cell = 46;
        float startX = cx - cell;
        drawIsoBlock(canvas, cx, top + 70, 190, 170, 34,
                Color.rgb(203, 194, 171),
                Color.rgb(154, 137, 112),
                Color.rgb(122, 110, 94));
        for (int col = 1; col <= 3; col += 1) {
            for (int row = 1; row <= 4; row += 1) {
                float x = startX + (col - 1) * cell;
                float yy = top + (4 - row) * 40;
                boolean target = col == 2 && row == 3;
                boolean current = col == state.coordCol && row == state.coordRow;
                int fill = target ? Color.rgb(213, 233, 206) : Color.rgb(241, 235, 214);
                if (current) fill = gold;
                drawDiamond(canvas, x, yy, 42, 24, fill, true);
                if (target) {
                    paint.setStyle(Paint.Style.FILL);
                    paint.setColor(green);
                    canvas.drawCircle(x, yy, 5, paint);
                }
            }
        }
        float px = startX + (state.coordCol - 1) * cell;
        float py = top + (4 - state.coordRow) * 40;
        drawAvatar(canvas, px, py + 34);
        drawGoal(canvas, startX + cell, top + 40 + 4, state.solved());

        drawHandle(canvas, cx - 68, screenH - 210, "列" + state.coordCol, gold);
        addTarget("col", "", cx - 112, screenH - 252, 88, 84);
        drawHandle(canvas, cx + 68, screenH - 210, "层" + state.coordRow, blue);
        addTarget("row", "", cx + 24, screenH - 252, 88, 84);
        addGoalTarget(startX + cell, top + 44);
    }

    private void drawFeedback(Canvas canvas) {
        String text = state.feedback;
        if (text == null || text.length() == 0) return;
        float width = Math.min(screenW - 54, Math.max(150, text.length() * 12 + 32));
        float x = (screenW - width) / 2f;
        float y = screenH - 58;
        roundRect(canvas, x, y, width, 30, 15, panel, panelLine);
        drawText(canvas, text, screenW / 2f, y + 20, 11, ink, true, Paint.Align.CENTER);
    }

    private void drawConceptBar(Canvas canvas) {
        String text = state.conceptTags();
        int maxChars = Math.max(14, (int) (screenW / 8.5f));
        if (text.length() > maxChars) {
            text = text.substring(0, Math.max(0, maxChars - 3)) + "...";
        }
        float width = Math.min(screenW - 40, Math.max(180, text.length() * 8 + 36));
        float x = (screenW - width) / 2f;
        float y = 74;
        roundRect(canvas, x, y, width, 24, 12, Color.argb(222, 255, 250, 234), panelLine);
        drawText(canvas, text, screenW / 2f, y + 16, 9, muted, true, Paint.Align.CENTER);
    }

    private void drawGoal(Canvas canvas, float x, float y, boolean open) {
        paint.setStyle(Paint.Style.FILL);
        if (open) {
            paint.setColor(Color.argb(70, 116, 215, 230));
            canvas.drawCircle(x, y - 7, 44, paint);
            paint.setColor(Color.argb(95, 255, 232, 159));
            canvas.drawCircle(x, y - 7, 30, paint);
        }
        paint.setColor(shadow);
        canvas.drawOval(new RectF(x - 26, y + 30, x + 26, y + 42), paint);
        drawIsoBlock(canvas, x, y + 28, 56, 30, 16,
                open ? Color.rgb(213, 238, 202) : Color.rgb(230, 220, 198),
                open ? Color.rgb(134, 178, 111) : Color.rgb(171, 154, 126),
                open ? Color.rgb(93, 142, 91) : Color.rgb(139, 124, 105));
        Path arch = new Path();
        arch.moveTo(x - 24, y + 26);
        arch.lineTo(x - 24, y - 10);
        arch.quadTo(x, y - 40, x + 24, y - 10);
        arch.lineTo(x + 24, y + 26);
        arch.close();
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(open ? Color.rgb(177, 218, 159) : Color.rgb(230, 220, 198));
        canvas.drawPath(arch, paint);
        if (open) {
            paint.setColor(Color.rgb(80, 166, 139));
            Path portal = new Path();
            portal.moveTo(x - 12, y + 25);
            portal.lineTo(x - 12, y - 8);
            portal.quadTo(x, y - 22, x + 12, y - 8);
            portal.lineTo(x + 12, y + 25);
            portal.close();
            canvas.drawPath(portal, paint);
        }
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(3);
        paint.setColor(open ? green : panelLine);
        canvas.drawPath(arch, paint);
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(open ? green : Color.rgb(169, 147, 114));
        canvas.drawCircle(x, y - 4, 7, paint);
        if (open) {
            paint.setColor(Color.rgb(255, 250, 234));
            canvas.drawCircle(x, y - 4, 3, paint);
        }
    }

    private void addGoalTarget(float x, float y) {
        Target target = addTarget("goal", "", x - 38, y - 50, 76, 96);
        target.actionX = x;
        target.actionY = y;
    }

    private void drawAvatar(Canvas canvas, float x, float y) {
        float drawX = x;
        float drawY = y;
        if (walkingToDoor) {
            float t = Math.min(1f, (SystemClock.uptimeMillis() - walkStartMs) / (float) WALK_DURATION_MS);
            float eased = t * t * (3f - 2f * t);
            drawX = walkStartX + (walkEndX - walkStartX) * eased;
            drawY = walkStartY + (walkEndY - walkStartY) * eased - (float) Math.sin(t * Math.PI) * 8f;
        } else {
            lastAvatarX = x;
            lastAvatarY = y;
        }
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(shadow);
        canvas.drawOval(new RectF(drawX - 18, drawY + 26, drawX + 18, drawY + 36), paint);
        paint.setColor(Color.rgb(246, 201, 142));
        canvas.drawCircle(drawX, drawY - 10, 13, paint);
        roundRect(canvas, drawX - 16, drawY + 2, 32, 38, 12, blue, Color.argb(55, 35, 44, 52));
        paint.setColor(Color.rgb(255, 244, 184));
        canvas.drawCircle(drawX - 6, drawY + 18, 3, paint);
        canvas.drawCircle(drawX + 6, drawY + 18, 3, paint);
    }

    private void drawFractionDoor(Canvas canvas, float x, float y, float radius, boolean placed, String label) {
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(4);
        paint.setColor(placed ? green : panelLine);
        canvas.drawCircle(x, y, radius, paint);
        paint.setStyle(Paint.Style.FILL);
        if (placed) {
            paint.setColor(Color.argb(190, 82, 156, 115));
            canvas.drawArc(new RectF(x - radius, y - radius, x + radius, y + radius), 90, 180, true, paint);
        } else {
            paint.setColor(Color.argb(72, 222, 111, 88));
            canvas.drawArc(new RectF(x - radius, y - radius, x + radius, y + radius), 90, 180, true, paint);
        }
    }

    private void drawHalfPiece(Canvas canvas, float x, float y, float radius, String label, boolean selected) {
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(selected ? Color.rgb(255, 232, 159) : Color.rgb(244, 221, 173));
        canvas.drawArc(new RectF(x - radius, y - radius, x + radius, y + radius), 270, 180, true, paint);
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(selected ? 4 : 2);
        paint.setColor(selected ? gold : panelLine);
        canvas.drawArc(new RectF(x - radius, y - radius, x + radius, y + radius), 270, 180, true, paint);
        paint.setStyle(Paint.Style.FILL);
        drawText(canvas, label, x, y + 6, 12, ink, true, Paint.Align.CENTER);
    }

    private Paint paintWithColor(int color) {
        paint.setColor(color);
        return paint;
    }

    private void drawIsoBlock(Canvas canvas, float cx, float cy, float width, float height, float depth,
                              int topColor, int leftColor, int rightColor) {
        Path top = new Path();
        top.moveTo(cx, cy - height / 2f);
        top.lineTo(cx + width / 2f, cy);
        top.lineTo(cx, cy + height / 2f);
        top.lineTo(cx - width / 2f, cy);
        top.close();

        Path right = new Path();
        right.moveTo(cx + width / 2f, cy);
        right.lineTo(cx, cy + height / 2f);
        right.lineTo(cx, cy + height / 2f + depth);
        right.lineTo(cx + width / 2f, cy + depth);
        right.close();

        Path left = new Path();
        left.moveTo(cx - width / 2f, cy);
        left.lineTo(cx, cy + height / 2f);
        left.lineTo(cx, cy + height / 2f + depth);
        left.lineTo(cx - width / 2f, cy + depth);
        left.close();

        paint.setStyle(Paint.Style.FILL);
        paint.setColor(shadow);
        canvas.drawPath(offsetPath(top, 0, depth + 8), paint);
        paint.setColor(leftColor);
        canvas.drawPath(left, paint);
        paint.setColor(rightColor);
        canvas.drawPath(right, paint);
        paint.setColor(topColor);
        canvas.drawPath(top, paint);

        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(2);
        paint.setColor(Color.argb(90, 35, 44, 52));
        canvas.drawPath(top, paint);
        canvas.drawPath(left, paint);
        canvas.drawPath(right, paint);
        paint.setStyle(Paint.Style.FILL);
    }

    private void drawHandle(Canvas canvas, float x, float y, String label, int fill) {
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(shadow);
        canvas.drawOval(new RectF(x - 23, y + 15, x + 23, y + 25), paint);
        paint.setColor(fill);
        canvas.drawCircle(x, y, 24, paint);
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(3);
        paint.setColor(Color.argb(120, 35, 44, 52));
        canvas.drawCircle(x, y, 24, paint);
        paint.setStyle(Paint.Style.FILL);
        drawText(canvas, label, x, y + 5, label.length() > 2 ? 10 : 14, ink, true, Paint.Align.CENTER);
    }

    private void drawRightAngleMarker(Canvas canvas, float x, float y) {
        Path mark = new Path();
        mark.moveTo(x - 32, y);
        mark.lineTo(x - 32, y - 32);
        mark.lineTo(x, y - 32);
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(4);
        paint.setStrokeCap(Paint.Cap.ROUND);
        paint.setColor(Color.rgb(255, 232, 159));
        canvas.drawPath(mark, paint);
        paint.setStrokeCap(Paint.Cap.BUTT);
        paint.setStyle(Paint.Style.FILL);
    }

    private void drawDiamond(Canvas canvas, float cx, float cy, float width, float height, int color, boolean stroke) {
        Path path = new Path();
        path.moveTo(cx, cy - height / 2f);
        path.lineTo(cx + width / 2f, cy);
        path.lineTo(cx, cy + height / 2f);
        path.lineTo(cx - width / 2f, cy);
        path.close();
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(shadow);
        canvas.drawPath(offsetPath(path, 0, 5), paint);
        paint.setColor(color);
        canvas.drawPath(path, paint);
        if (stroke) {
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(2);
            paint.setColor(Color.argb(95, 35, 44, 52));
            canvas.drawPath(path, paint);
            paint.setStyle(Paint.Style.FILL);
        }
    }

    private Path offsetPath(Path path, float dx, float dy) {
        Path result = new Path(path);
        result.offset(dx, dy);
        return result;
    }

    private void roundRect(Canvas canvas, float x, float y, float width, float height, float radius, int fill, int stroke) {
        RectF rect = new RectF(x, y, x + width, y + height);
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(fill);
        canvas.drawRoundRect(rect, radius, radius, paint);
        if (stroke != 0) {
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(2);
            paint.setColor(stroke);
            canvas.drawRoundRect(rect, radius, radius, paint);
            paint.setStyle(Paint.Style.FILL);
        }
    }

    private void drawText(Canvas canvas, String text, float x, float y, float size, int color, boolean bold, Paint.Align align) {
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(color);
        paint.setTextSize(size);
        paint.setTextAlign(align);
        paint.setTypeface(Typeface.create(Typeface.SANS_SERIF, bold ? Typeface.BOLD : Typeface.NORMAL));
        canvas.drawText(text, x, y, paint);
    }

    private Target hitTarget(float x, float y) {
        for (int i = targets.size() - 1; i >= 0; i -= 1) {
            Target target = targets.get(i);
            if (target.rect.contains(x, y)) return target;
        }
        return null;
    }

    private Target addTarget(String type, String id, float x, float y, float width, float height) {
        Target target = new Target();
        target.type = type;
        target.id = id;
        target.rect = new RectF(x, y, x + width, y + height);
        target.actionX = x + width / 2f;
        target.actionY = y + height / 2f;
        targets.add(target);
        return target;
    }

    private static final class Target {
        String type;
        String id;
        RectF rect;
        float actionX;
        float actionY;
    }
}
