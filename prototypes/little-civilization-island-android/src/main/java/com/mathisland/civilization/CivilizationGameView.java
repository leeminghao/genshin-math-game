package com.mathisland.civilization;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.view.MotionEvent;
import android.view.View;

import java.util.ArrayList;
import java.util.List;

final class CivilizationGameView extends View {
    private static final float WORLD_W = 900;
    private static final float WORLD_H = 1300;

    private final GameState state = new GameState();
    private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final List<Target> targets = new ArrayList<>();

    private static final float START_X = 292;
    private static final float START_Y = 550;

    private float heroX = START_X;
    private float heroY = START_Y;
    private float cameraX = 0;
    private float cameraY = 0;
    private float moveX = 0;
    private float moveY = 0;
    private boolean moving = false;
    private int movePointerId = -1;
    private long lastFrameTime = 0;
    private String displayedFeedback = "";
    private long feedbackChangedAt = 0;

    private final int grass = Color.rgb(194, 224, 148);
    private final int grassDark = Color.rgb(113, 151, 86);
    private final int water = Color.rgb(109, 185, 219);
    private final int sand = Color.rgb(226, 203, 143);
    private final int soil = Color.rgb(155, 104, 62);
    private final int panel = Color.rgb(255, 249, 232);
    private final int ink = Color.rgb(35, 49, 42);
    private final int muted = Color.rgb(91, 103, 90);
    private final int orange = Color.rgb(229, 136, 55);
    private final int green = Color.rgb(74, 145, 80);
    private final int blue = Color.rgb(78, 137, 198);
    private final int brown = Color.rgb(118, 78, 48);
    private final int clay = Color.rgb(184, 119, 82);
    private final int red = Color.rgb(194, 73, 63);
    private final int line = Color.rgb(53, 76, 56);

    CivilizationGameView(Context context) {
        super(context);
        setFocusable(true);
        setBackgroundColor(Color.BLACK);
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        float density = getResources().getDisplayMetrics().density;
        float screenW = getWidth() / density;
        float screenH = getHeight() / density;
        updateHero();
        cameraX = clamp(heroX - screenW * 0.50f, 0, Math.max(0, WORLD_W - screenW));
        cameraY = clamp(heroY - screenH * 0.50f, 0, Math.max(0, WORLD_H - screenH));

        targets.clear();
        canvas.save();
        canvas.scale(density, density);
        updateFeedbackClock();
        drawWorld(canvas, screenW, screenH);
        canvas.save();
        canvas.translate(-cameraX, -cameraY);
        drawWorldObjects(canvas);
        Target nearest = nearestTarget();
        drawHero(canvas, nearest);
        drawFeedbackBubble(canvas);
        canvas.restore();
        drawHud(canvas, screenW, screenH, nearest);
        canvas.restore();

        postInvalidateOnAnimation();
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        float density = getResources().getDisplayMetrics().density;
        float screenX = event.getX() / density;
        float screenY = event.getY() / density;
        float screenW = getWidth() / density;
        float screenH = getHeight() / density;

        int action = event.getActionMasked();
        if (action == MotionEvent.ACTION_DOWN || action == MotionEvent.ACTION_POINTER_DOWN) {
            int index = event.getActionIndex();
            float x = event.getX(index) / density;
            float y = event.getY(index) / density;
            if (isActionButton(x, y, screenW, screenH)) {
                performAction(nearestTarget());
                invalidate();
                return true;
            }
            if (x < screenW * 0.58f && y > screenH * 0.56f) {
                moving = true;
                movePointerId = event.getPointerId(index);
                updateMove(x, y, screenH);
            }
        } else if (action == MotionEvent.ACTION_MOVE && moving) {
            int index = event.findPointerIndex(movePointerId);
            if (index >= 0) {
                updateMove(event.getX(index) / density, event.getY(index) / density, screenH);
            }
        } else if (action == MotionEvent.ACTION_UP || action == MotionEvent.ACTION_CANCEL || action == MotionEvent.ACTION_POINTER_UP) {
            int index = event.getActionIndex();
            if (event.getPointerId(index) == movePointerId) {
                moving = false;
                movePointerId = -1;
                moveX = 0;
                moveY = 0;
            }
        }

        if (action == MotionEvent.ACTION_UP && !isActionButton(screenX, screenY, screenW, screenH)) {
            Target tapped = targetAt(screenX + cameraX, screenY + cameraY);
            if (tapped != null) {
                state.feedback = "走近" + tapped.label + "。";
            }
        }
        return true;
    }

    private void updateMove(float x, float y, float screenH) {
        float baseX = 72;
        float baseY = screenH - 126;
        float dx = x - baseX;
        float dy = y - baseY;
        float length = (float) Math.sqrt(dx * dx + dy * dy);
        if (length < 8) {
            moveX = 0;
            moveY = 0;
            return;
        }
        moveX = dx / length;
        moveY = dy / length;
    }

    private void updateHero() {
        long now = System.nanoTime();
        if (lastFrameTime == 0) {
            lastFrameTime = now;
            return;
        }
        float dt = Math.min(0.033f, (now - lastFrameTime) / 1_000_000_000f);
        lastFrameTime = now;
        if (moving) {
            float speed = 190;
            heroX = clamp(heroX + moveX * speed * dt, 55, WORLD_W - 55);
            heroY = clamp(heroY + moveY * speed * dt, 120, WORLD_H - 80);
        }
    }

    private void performAction(Target target) {
        if (target == null) {
            state.feedback = "再靠近一点。";
            return;
        }
        switch (target.type) {
            case "campfire":
                state.inspectCampfire();
                break;
            case "resident":
                if (!state.countedResidents[target.index]) {
                    state.countResident(target.index);
                } else {
                    state.feedResident(target.index);
                }
                break;
            case "food":
                state.countFood(target.index);
                break;
            case "resource":
                state.pickResource(target.id);
                break;
            case "zone":
                state.depositCarried(target.zone);
                break;
            case "field":
                state.toggleFieldCell(target.row, target.col);
                break;
            case "granary":
                state.toggleGranaryCell(target.row, target.col);
                break;
            case "tablet":
                state.carveRecord(nextRecordKey());
                break;
            case "restart":
                state.reset();
                heroX = START_X;
                heroY = START_Y;
                break;
            default:
                state.feedback = "这里今天还用不上。";
        }
    }

    private String nextRecordKey() {
        if (!state.records.contains("people")) return "people";
        if (!state.records.contains("food")) return "food";
        if (!state.records.contains("field")) return "field";
        return "granary";
    }

    private void drawWorld(Canvas canvas, float screenW, float screenH) {
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(water);
        canvas.drawRect(0, 0, screenW, screenH, paint);

        canvas.save();
        canvas.translate(-cameraX, -cameraY);
        paint.setColor(sand);
        canvas.drawOval(new RectF(-70, 52, WORLD_W + 70, WORLD_H - 24), paint);
        paint.setColor(grass);
        canvas.drawOval(new RectF(-22, 92, WORLD_W + 22, WORLD_H - 70), paint);
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(4);
        paint.setColor(grassDark);
        canvas.drawOval(new RectF(-22, 92, WORLD_W + 22, WORLD_H - 70), paint);
        paint.setStyle(Paint.Style.FILL);

        paint.setColor(Color.argb(62, 99, 164, 202));
        canvas.drawOval(new RectF(610, 585, 840, 662), paint);
        drawPatch(canvas, 126, 790, 128, 70, Color.argb(45, 95, 130, 80));
        drawPatch(canvas, 616, 372, 168, 72, Color.argb(48, 95, 130, 80));
        drawPatch(canvas, 360, 486, 184, 130, Color.argb(60, 238, 206, 146));
        drawTrail(canvas);
        drawGrassTuft(canvas, 312, 492);
        drawGrassTuft(canvas, 588, 596);
        drawGrassTuft(canvas, 518, 706);
        drawGrassTuft(canvas, 354, 678);
        canvas.restore();
    }

    private void drawWorldObjects(Canvas canvas) {
        if (state.recordDone()) {
            drawDistantMarket(canvas, 760, 210);
        }
        if (state.mealsDone()) {
            drawFloodedFieldPreview(canvas, 642, 520);
        }
        if (state.fieldDone()) {
            drawBrokenGranary(canvas, 210, 635);
        }
        drawCampfire(canvas, 450, 560);
        addTarget("campfire", "火堆", 450, 560, 48);
        drawAbilityDots(canvas, 450, 604);
        drawCountingBoard(canvas, 450, 470);

        drawResident(canvas, 338, 520, 0);
        addTarget("resident", "小禾", 338, 520, 50).index = 0;
        drawResident(canvas, 538, 660, 1);
        addTarget("resident", "石叔", 538, 660, 50).index = 1;
        drawResident(canvas, 590, 508, 2);
        addTarget("resident", "泥婆", 590, 508, 50).index = 2;
        drawMealBowls(canvas);

        drawFoodGroup(canvas);
        drawClassificationZones(canvas);
        drawLooseResources(canvas);
        drawFieldGrid(canvas);
        drawGranaryGrid(canvas);
        drawTablet(canvas, 490, 790);

        if (state.recordDone()) {
            drawBeacon(canvas, 760, 210);
            addTarget("restart", "重新开始", 760, 210, 64);
        }
    }

    private void drawFoodGroup(Canvas canvas) {
        float[][] positions = { { 326, 392 }, { 370, 388 }, { 338, 432 }, { 388, 430 } };
        for (int i = 0; i < positions.length; i += 1) {
            if (!state.countedFood[i]) {
                drawResourceIcon(canvas, positions[i][0], positions[i][1], "food", false);
                addTarget("food", "粮食", positions[i][0], positions[i][1], 34).index = i;
            }
        }
    }

    private void drawClassificationZones(Canvas canvas) {
        boolean showZones = (state.countingDone() && !state.classificationDone()) || state.carriedResource() != null;
        boolean showStock = state.countingDone() && !state.mealsDone();
        if (!showZones && !showStock) return;

        GameState.Zone[] zones = { GameState.Zone.EAT, GameState.Zone.PLANT, GameState.Zone.BUILD, GameState.Zone.RECORD };
        String[] labels = { "饭碗边", "田边", "仓基", "泥台" };
        int[] fills = {
                Color.rgb(238, 185, 87),
                Color.rgb(126, 190, 94),
                Color.rgb(174, 132, 86),
                Color.rgb(197, 131, 91)
        };
        float[][] points = { { 360, 628 }, { 420, 660 }, { 486, 660 }, { 546, 628 } };
        if (showZones) {
            for (int i = 0; i < zones.length; i += 1) {
                drawBasket(canvas, points[i][0], points[i][1], fills[i]);
                drawZoneGlyph(canvas, zones[i], points[i][0], points[i][1]);
                Target target = addTarget("zone", labels[i], points[i][0], points[i][1], 35);
                target.zone = zones[i];
            }
            drawRejectedTrace(canvas, points, zones);
        }
        drawZoneStock(canvas, 356, 698);
    }

    private void drawLooseResources(Canvas canvas) {
        if (!state.countingDone()) return;
        int index = 0;
        for (GameState.Resource resource : state.resources) {
            if (resource.zone != null || resource.carried) continue;
            float x = 154 + (index % 3) * 55;
            float y = 770 + (index / 3) * 52;
            drawResourceIcon(canvas, x, y, resource.kind, resource.id.equals(state.carriedResourceId));
            Target target = addTarget("resource", resourceLabel(resource.kind), x, y, 35);
            target.id = resource.id;
            index += 1;
        }
    }

    private void drawMealBowls(Canvas canvas) {
        if (!state.classificationDone() || state.mealsDone()) return;
        float[][] bowls = { { 338, 574 }, { 538, 714 }, { 590, 562 } };
        for (int i = 0; i < bowls.length; i += 1) {
            boolean served = state.meals[i];
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(served ? Color.rgb(255, 216, 136) : Color.rgb(255, 249, 232));
            canvas.drawOval(new RectF(bowls[i][0] - 17, bowls[i][1] - 8, bowls[i][0] + 17, bowls[i][1] + 9), paint);
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(2);
            paint.setColor(served ? orange : Color.argb(90, 35, 49, 42));
            canvas.drawOval(new RectF(bowls[i][0] - 17, bowls[i][1] - 8, bowls[i][0] + 17, bowls[i][1] + 9), paint);
            paint.setStyle(Paint.Style.FILL);
            if (!served) {
                drawText(canvas, "1", bowls[i][0], bowls[i][1] + 5, 11, muted, true, Paint.Align.CENTER);
            }
        }
    }

    private void drawZoneGlyph(Canvas canvas, GameState.Zone zone, float x, float y) {
        String text = "?";
        if (zone == GameState.Zone.EAT) text = "饭";
        if (zone == GameState.Zone.PLANT) text = "田";
        if (zone == GameState.Zone.BUILD) text = "仓";
        if (zone == GameState.Zone.RECORD) text = "记";
        drawText(canvas, text, x, y + 5, 12, Color.argb(210, 35, 49, 42), true, Paint.Align.CENTER);
    }

    private void drawZoneStock(Canvas canvas, float x, float y) {
        int food = state.countResources("food", GameState.Zone.EAT);
        int seed = state.countResources("seed", GameState.Zone.PLANT);
        int wood = state.countResources("wood", GameState.Zone.BUILD);
        int stone = state.countResources("stone", GameState.Zone.BUILD);
        int clayCount = state.countResources("clay", GameState.Zone.RECORD);

        if (food + seed + wood + stone + clayCount == 0) return;

        roundRect(canvas, x - 78, y - 22, 156, 72, 12, Color.argb(224, 255, 249, 232), Color.argb(42, 35, 49, 42));
        drawStockLine(canvas, "饭", food, "够3人", x - 60, y - 4, food >= 3 ? green : muted);
        drawStockLine(canvas, "种", seed, "明天田", x - 60, y + 16, seed > 0 ? green : muted);
        drawStockLine(canvas, "材", wood + stone, "修仓", x - 60, y + 36, wood + stone >= 4 ? green : muted);
        if (clayCount > 0) {
            drawText(canvas, "泥 1 记今天", x + 24, y + 36, 10, clay, true, Paint.Align.LEFT);
        }
    }

    private void drawStockLine(Canvas canvas, String name, int count, String use, float x, float y, int color) {
        drawText(canvas, name, x, y, 10, muted, true, Paint.Align.LEFT);
        drawText(canvas, String.valueOf(count), x + 20, y, 12, color, true, Paint.Align.LEFT);
        drawText(canvas, use, x + 42, y, 10, muted, false, Paint.Align.LEFT);
    }

    private void drawRejectedTrace(Canvas canvas, float[][] points, GameState.Zone[] zones) {
        if (state.lastRejectedZone == null || state.lastRejectedKind.length() == 0) return;
        for (int i = 0; i < zones.length; i += 1) {
            if (zones[i] != state.lastRejectedZone) continue;
            float x = points[i][0];
            float y = points[i][1] - 42;
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(Color.argb(72, 194, 73, 63));
            canvas.drawCircle(x, y, 28, paint);
            drawResourceIcon(canvas, x - 10, y, state.lastRejectedKind, false);
            drawText(canvas, "×", x + 18, y + 9, 24, red, true, Paint.Align.CENTER);
            drawText(canvas, rejectedHint(state.lastRejectedKind), x, y - 26, 11, red, true, Paint.Align.CENTER);
            break;
        }
    }

    private String rejectedHint(String kind) {
        if ("food".equals(kind)) return "会坏";
        if ("seed".equals(kind)) return "明天空";
        if ("wood".equals(kind) || "stone".equals(kind)) return "不能吃";
        if ("clay".equals(kind)) return "会忘";
        return "不合用";
    }

    private void drawFieldGrid(Canvas canvas) {
        if (!state.mealsDone()) return;
        float cell = 32;
        float startX = 618;
        float startY = 680;
        for (int row = 0; row < 3; row += 1) {
            for (int col = 0; col < 6; col += 1) {
                String id = row + ":" + col;
                boolean active = state.fieldCells.contains(id);
                roundRect(canvas, startX + col * cell, startY + row * cell, cell - 4, cell - 4, 6,
                        active ? Color.rgb(92, 154, 76) : Color.argb(214, 255, 249, 232), line);
                Target target = addTarget("field", "田格", startX + col * cell + cell / 2, startY + row * cell + cell / 2, cell / 2);
                target.row = row;
                target.col = col;
            }
        }
    }

    private void drawGranaryGrid(Canvas canvas) {
        if (!state.fieldDone()) return;
        float cell = 34;
        float startX = 206;
        float startY = 710;
        for (int row = 0; row < 3; row += 1) {
            for (int col = 0; col < 3; col += 1) {
                String id = row + ":" + col;
                boolean active = state.granaryCells.contains(id);
                roundRect(canvas, startX + col * cell, startY + row * cell, cell - 4, cell - 4, 6,
                        active ? brown : Color.argb(214, 255, 249, 232), line);
                Target target = addTarget("granary", "地基", startX + col * cell + cell / 2, startY + row * cell + cell / 2, cell / 2);
                target.row = row;
                target.col = col;
            }
        }
    }

    private void drawTablet(Canvas canvas, float x, float y) {
        if (!state.fieldDone()) return;
        boolean active = state.granaryDone();
        roundRect(canvas, x - 34, y - 26, 68, 52, 12, active ? clay : Color.rgb(183, 158, 138), Color.rgb(126, 77, 49));
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(2);
        paint.setColor(Color.rgb(98, 60, 40));
        for (int i = 0; i < state.records.size(); i += 1) {
            float yLine = y - 12 + i * 8;
            canvas.drawLine(x - 16, yLine, x + 18, yLine, paint);
        }
        paint.setStyle(Paint.Style.FILL);
        addTarget("tablet", "泥板", x, y, 40);
    }

    private void drawHud(Canvas canvas, float screenW, float screenH, Target nearest) {
        float goalW = Math.min(screenW - 92, 206);
        roundRect(canvas, 14, 18, goalW, 46, 18, Color.argb(214, 255, 249, 232), Color.argb(28, 35, 49, 42));
        drawText(canvas, worldGoal(), 30, 48, 18, ink, true, Paint.Align.LEFT);
        roundRect(canvas, screenW - 70, 23, 56, 34, 16, Color.argb(202, 255, 249, 232), Color.argb(28, 35, 49, 42));
        drawText(canvas, "第" + state.day + "天", screenW - 42, 45, 12, brown, true, Paint.Align.CENTER);

        if (state.carriedResource() != null) {
            roundRect(canvas, screenW - 86, 78, 72, 26, 13, Color.argb(230, 255, 244, 184), orange);
            drawText(canvas, "拿着", screenW - 58, 95, 12, ink, true, Paint.Align.CENTER);
            drawResourceIcon(canvas, screenW - 26, 91, state.carriedResource().kind, false);
        }

        drawJoystick(canvas, screenH);
        drawActionButton(canvas, screenW, screenH, nearest);
    }

    private String worldGoal() {
        if (!state.countingDone()) return "先数清楚";
        if (!state.classificationDone()) return "分好东西";
        if (!state.mealsDone()) return "一人一份";
        if (!state.fieldDone()) return "圈 6 格田";
        if (!state.granaryDone()) return "搭 2x2 仓";
        if (!state.recordDone()) return "刻下今天";
        return "去新地方";
    }

    private void drawFeedbackBubble(Canvas canvas) {
        if (displayedFeedback.length() == 0) return;
        long age = System.currentTimeMillis() - feedbackChangedAt;
        if (age > 3600) return;

        String message = shortFeedback(displayedFeedback);
        paint.setTextSize(13);
        paint.setTypeface(Typeface.create(Typeface.SANS_SERIF, Typeface.BOLD));
        float bubbleW = clamp(paint.measureText(message) + 28, 82, 150);
        float bubbleH = 34;
        float screenW = getWidth() / getResources().getDisplayMetrics().density;
        float screenH = getHeight() / getResources().getDisplayMetrics().density;
        boolean rightSide = heroX + 38 + bubbleW < cameraX + screenW - 16;
        float x = rightSide ? heroX + 34 : heroX - bubbleW - 34;
        float y = clamp(heroY - 66, cameraY + 82, cameraY + screenH - 172);
        roundRect(canvas, x, y, bubbleW, bubbleH, 18, Color.argb(228, 255, 249, 232), Color.argb(42, 35, 49, 42));
        drawText(canvas, message, x + bubbleW / 2, y + 22, 13, ink, true, Paint.Align.CENTER);

        paint.setStyle(Paint.Style.FILL);
        paint.setColor(Color.argb(228, 255, 249, 232));
        Path tail = new Path();
        if (rightSide) {
            tail.moveTo(x + 4, y + bubbleH - 7);
            tail.lineTo(x + 4, y + bubbleH - 21);
            tail.lineTo(heroX + 16, heroY - 28);
        } else {
            tail.moveTo(x + bubbleW - 4, y + bubbleH - 7);
            tail.lineTo(x + bubbleW - 4, y + bubbleH - 21);
            tail.lineTo(heroX - 16, heroY - 28);
        }
        tail.close();
        canvas.drawPath(tail, paint);
    }

    private String shortFeedback(String text) {
        if (!firstCountStarted()) return "数人和粮";
        if (text.contains("先看看人和粮") || text.contains("先数人和粮") || text.contains("饭够不够") || text.contains("先数清楚")) return "数人和粮";
        if (text.contains("一个东西对应一个记号")) return "一物一记号";
        if (text.contains("3 个居民")) return "3人 4粮";
        if (text.contains("乱成一堆") || text.contains("分开放") || text.contains("分清")) return "分开放";
        if (text.contains("拿起来")) return "找用途";
        if (text.contains("放错") || text.contains("不能吃") || text.contains("用不上")) return "放错了";
        if (text.contains("收好了") || text.contains("留下") || text.contains("修仓") || text.contains("压稳") || text.contains("刻下今天")) return "放对了";
        if (text.contains("分饭") || text.contains("一人一份") || text.contains("空着")) return "一人一份";
        if (text.contains("每个人都有饭")) return "都吃到了";
        if (text.contains("圈了")) return text.replace("，还不够。", "");
        if (text.contains("6 格田稳")) return "6格田稳了";
        if (text.contains("太长了")) return "太长低效";
        if (text.contains("田埂")) return "田会漏";
        if (text.contains("地基摆了")) return text.replace("，还不稳。", "");
        if (text.contains("粮仓站稳")) return "仓站稳了";
        if (text.contains("地基歪") || text.contains("方方正正")) return "仓会倒";
        if (text.contains("泥板记住")) return "记住今天";
        if (text.contains("刻下 ")) return text.replace(" 件事。", "");
        if (text.contains("在那边")) return "走过去";
        if (text.length() <= 7) return text;
        return text.substring(0, 7);
    }

    private boolean firstCountStarted() {
        for (boolean counted : state.countedResidents) {
            if (counted) return true;
        }
        for (boolean counted : state.countedFood) {
            if (counted) return true;
        }
        return false;
    }

    private void updateFeedbackClock() {
        if (!state.feedback.equals(displayedFeedback)) {
            displayedFeedback = state.feedback;
            feedbackChangedAt = System.currentTimeMillis();
        }
    }

    private void drawJoystick(Canvas canvas, float screenH) {
        float baseX = 72;
        float baseY = screenH - 126;
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(Color.argb(42, 35, 49, 42));
        canvas.drawCircle(baseX, baseY, 42, paint);
        paint.setColor(Color.argb(230, 255, 249, 232));
        canvas.drawCircle(baseX + moveX * 20, baseY + moveY * 20, 19, paint);
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(2);
        paint.setColor(Color.argb(55, 35, 49, 42));
        canvas.drawCircle(baseX, baseY, 42, paint);
        paint.setStyle(Paint.Style.FILL);
    }

    private void drawActionButton(Canvas canvas, float screenW, float screenH, Target nearest) {
        float x = screenW - 72;
        float y = screenH - 126;
        boolean active = nearest != null;
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(active ? Color.rgb(255, 216, 136) : Color.argb(190, 255, 249, 232));
        canvas.drawCircle(x, y, 39, paint);
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(3);
        paint.setColor(active ? orange : Color.argb(45, 35, 49, 42));
        canvas.drawCircle(x, y, 39, paint);
        paint.setStyle(Paint.Style.FILL);
        drawText(canvas, active ? "行动" : "找", x, y + 5, 15, ink, true, Paint.Align.CENTER);
        if (active) {
            drawText(canvas, nearest.label, x, y - 15, 10, muted, true, Paint.Align.CENTER);
        }
    }

    private void drawCountingBoard(Canvas canvas, float x, float y) {
        if (state.countingDone()) return;
        roundRect(canvas, x - 88, y - 31, 176, 62, 12, Color.argb(226, 255, 249, 232), Color.argb(55, 35, 49, 42));
        drawText(canvas, "人", x - 72, y - 8, 12, muted, true, Paint.Align.CENTER);
        drawText(canvas, "粮", x - 72, y + 19, 12, muted, true, Paint.Align.CENTER);

        for (int i = 0; i < 3; i += 1) {
            drawCountStone(canvas, x - 42 + i * 25, y - 12, state.countedResidents[i], blue);
        }
        for (int i = 0; i < 4; i += 1) {
            drawCountStone(canvas, x - 42 + i * 25, y + 15, state.countedFood[i], orange);
        }
    }

    private void drawCountStone(Canvas canvas, float x, float y, boolean active, int color) {
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(active ? color : Color.argb(92, 91, 103, 90));
        canvas.drawCircle(x, y, active ? 7 : 5, paint);
        if (active) {
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(2);
            paint.setColor(Color.argb(150, 255, 255, 255));
            canvas.drawCircle(x - 2, y - 2, 2, paint);
            paint.setStyle(Paint.Style.FILL);
        }
    }

    private boolean isActionButton(float x, float y, float screenW, float screenH) {
        float dx = x - (screenW - 72);
        float dy = y - (screenH - 126);
        return dx * dx + dy * dy <= 44 * 44;
    }

    private Target nearestTarget() {
        Target best = null;
        float bestDistance = Float.MAX_VALUE;
        for (Target target : targets) {
            float dx = target.x - heroX;
            float dy = target.y - heroY;
            float distance = (float) Math.sqrt(dx * dx + dy * dy);
            if (distance < bestDistance) {
                bestDistance = distance;
                best = target;
            }
        }
        return bestDistance <= 70 ? best : null;
    }

    private Target targetAt(float worldX, float worldY) {
        for (Target target : targets) {
            float dx = target.x - worldX;
            float dy = target.y - worldY;
            if (dx * dx + dy * dy <= target.radius * target.radius) return target;
        }
        return null;
    }

    private Target addTarget(String type, String label, float x, float y, float radius) {
        Target target = new Target();
        target.type = type;
        target.label = label;
        target.x = x;
        target.y = y;
        target.radius = radius;
        targets.add(target);
        return target;
    }

    private void drawHero(Canvas canvas, Target nearest) {
        if (nearest != null) {
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(3);
            paint.setColor(Color.argb(210, 255, 196, 72));
            canvas.drawCircle(nearest.x, nearest.y, nearest.radius + 8, paint);
            paint.setStyle(Paint.Style.FILL);
        }

        GameState.Resource carried = state.carriedResource();
        paint.setColor(Color.argb(45, 35, 49, 42));
        canvas.drawOval(new RectF(heroX - 18, heroY + 24, heroX + 18, heroY + 36), paint);
        paint.setColor(Color.rgb(241, 179, 106));
        canvas.drawCircle(heroX, heroY - 14, 14, paint);
        roundRect(canvas, heroX - 16, heroY, 32, 42, 13, Color.rgb(83, 139, 209), Color.argb(45, 35, 49, 42));
        paint.setColor(Color.rgb(255, 244, 184));
        canvas.drawCircle(heroX - 6, heroY + 18, 3, paint);
        canvas.drawCircle(heroX + 6, heroY + 18, 3, paint);
        if (carried != null) {
            drawResourceIcon(canvas, heroX + 22, heroY - 34, carried.kind, true);
        }
    }

    private void drawAbilityDots(Canvas canvas, float x, float y) {
        boolean[] active = {
                state.countingDone(),
                state.classificationDone(),
                state.mealsDone(),
                state.fieldDone(),
                state.granaryDone(),
                state.recordDone()
        };
        float startX = x - 43;
        for (int i = 0; i < active.length; i += 1) {
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(active[i] ? Color.rgb(255, 216, 136) : Color.argb(145, 255, 249, 232));
            canvas.drawCircle(startX + i * 17, y, active[i] ? 5 : 4, paint);
        }
    }

    private void drawResident(Canvas canvas, float x, float y, int index) {
        boolean counted = state.countedResidents[index];
        boolean fed = state.meals[index];
        int body = fed ? green : counted ? blue : Color.rgb(78, 137, 198);
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(Color.rgb(246, 200, 148));
        canvas.drawCircle(x, y - 18, 15, paint);
        roundRect(canvas, x - 18, y, 36, 46, 13, body, Color.argb(45, 35, 49, 42));
        paint.setColor(Color.argb(95, 255, 255, 255));
        canvas.drawCircle(x - 6, y + 18, 3, paint);
        canvas.drawCircle(x + 6, y + 18, 3, paint);
        if (!fed) {
            paint.setColor(red);
            canvas.drawCircle(x + 24, y - 24, 7, paint);
        }
    }

    private void drawCampfire(Canvas canvas, float x, float y) {
        roundRect(canvas, x - 32, y + 13, 64, 11, 5, brown, 0);
        Path flame = new Path();
        flame.moveTo(x, y - 34);
        flame.quadTo(x + 25, y - 2, x, y + 13);
        flame.quadTo(x - 24, y - 4, x, y - 34);
        paint.setColor(Color.rgb(249, 196, 78));
        paint.setStyle(Paint.Style.FILL);
        canvas.drawPath(flame, paint);
        flame.reset();
        flame.moveTo(x + 2, y - 22);
        flame.quadTo(x + 14, y, x, y + 8);
        flame.quadTo(x - 10, y - 2, x + 2, y - 22);
        paint.setColor(orange);
        canvas.drawPath(flame, paint);
    }

    private void drawBasket(Canvas canvas, float x, float y, int fill) {
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(fill);
        canvas.drawOval(new RectF(x - 24, y - 16, x + 24, y + 18), paint);
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(3);
        paint.setColor(brown);
        canvas.drawArc(new RectF(x - 23, y - 28, x + 23, y + 8), 200, 140, false, paint);
        canvas.drawOval(new RectF(x - 24, y - 16, x + 24, y + 18), paint);
        paint.setStyle(Paint.Style.FILL);
    }

    private void drawResourceIcon(Canvas canvas, float x, float y, String kind, boolean selected) {
        if (selected) {
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(Color.rgb(255, 244, 184));
            canvas.drawCircle(x, y, 28, paint);
        }
        if ("food".equals(kind)) {
            paint.setColor(Color.rgb(238, 185, 87));
            canvas.drawCircle(x - 6, y, 10, paint);
            canvas.drawCircle(x + 6, y, 10, paint);
            canvas.drawCircle(x, y - 9, 8, paint);
        } else if ("seed".equals(kind)) {
            paint.setColor(Color.rgb(112, 166, 80));
            canvas.drawOval(new RectF(x - 13, y - 9, x + 2, y + 11), paint);
            canvas.drawOval(new RectF(x - 1, y - 11, x + 14, y + 9), paint);
        } else if ("wood".equals(kind)) {
            roundRect(canvas, x - 18, y - 11, 36, 12, 6, Color.rgb(150, 91, 50), Color.rgb(95, 58, 34));
            roundRect(canvas, x - 15, y + 3, 34, 10, 5, Color.rgb(176, 111, 62), Color.rgb(95, 58, 34));
        } else if ("stone".equals(kind)) {
            paint.setColor(Color.rgb(152, 158, 158));
            canvas.drawOval(new RectF(x - 18, y - 12, x + 12, y + 12), paint);
            paint.setColor(Color.rgb(178, 184, 184));
            canvas.drawOval(new RectF(x - 4, y - 17, x + 18, y + 8), paint);
        } else if ("clay".equals(kind)) {
            roundRect(canvas, x - 17, y - 13, 34, 26, 8, clay, Color.rgb(126, 77, 49));
        }
        if (selected) {
            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(3);
            paint.setColor(orange);
            canvas.drawCircle(x, y, 28, paint);
            paint.setStyle(Paint.Style.FILL);
        }
    }

    private String resourceLabel(String kind) {
        if ("food".equals(kind)) return "粮食";
        if ("seed".equals(kind)) return "种子";
        if ("wood".equals(kind)) return "木头";
        if ("stone".equals(kind)) return "石头";
        if ("clay".equals(kind)) return "泥";
        return "物资";
    }

    private void drawFloodedFieldPreview(Canvas canvas, float x, float y) {
        float cell = 18;
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(2);
        paint.setColor(Color.argb(150, 55, 78, 57));
        for (int row = 0; row < 2; row += 1) {
            for (int col = 0; col < 3; col += 1) {
                canvas.drawRect(x + col * cell, y + row * cell, x + (col + 1) * cell, y + (row + 1) * cell, paint);
            }
        }
        paint.setStrokeWidth(4);
        paint.setColor(Color.argb(190, 78, 145, 200));
        canvas.drawLine(x - 10, y + 8, x + 70, y + 46, paint);
        paint.setStyle(Paint.Style.FILL);
    }

    private void drawBrokenGranary(Canvas canvas, float x, float y) {
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(5);
        paint.setColor(brown);
        Path path = new Path();
        path.moveTo(x - 32, y + 28);
        path.lineTo(x + 4, y - 10);
        path.lineTo(x + 38, y + 26);
        path.moveTo(x - 18, y + 28);
        path.lineTo(x - 10, y - 2);
        path.moveTo(x + 24, y + 28);
        path.lineTo(x + 10, y - 2);
        canvas.drawPath(path, paint);
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(Color.rgb(242, 198, 109));
        canvas.drawCircle(x - 12, y + 44, 4, paint);
        canvas.drawCircle(x + 2, y + 49, 4, paint);
        canvas.drawCircle(x + 16, y + 44, 4, paint);
    }

    private void drawDistantMarket(Canvas canvas, float x, float y) {
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(4);
        paint.setColor(Color.argb(116, 120, 80, 48));
        canvas.drawLine(x - 32, y + 28, x, y, paint);
        canvas.drawLine(x + 32, y + 28, x, y, paint);
        canvas.drawLine(x - 22, y + 23, x + 22, y + 23, paint);
        paint.setStyle(Paint.Style.FILL);
    }

    private void drawBeacon(Canvas canvas, float x, float y) {
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(Color.argb(120, 255, 216, 136));
        canvas.drawCircle(x, y, 64, paint);
        paint.setColor(Color.rgb(255, 216, 136));
        canvas.drawCircle(x, y, 18, paint);
    }

    private void drawPatch(Canvas canvas, float x, float y, float width, float height, int color) {
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(color);
        canvas.drawOval(new RectF(x, y, x + width, y + height), paint);
    }

    private void drawTrail(Canvas canvas) {
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeCap(Paint.Cap.ROUND);
        paint.setStrokeJoin(Paint.Join.ROUND);
        Path path = new Path();
        path.moveTo(450, 560);
        path.cubicTo(410, 520, 372, 474, 350, 416);
        path.moveTo(450, 560);
        path.cubicTo(490, 600, 520, 636, 538, 660);
        path.moveTo(450, 560);
        path.cubicTo(502, 536, 548, 516, 590, 508);
        paint.setStrokeWidth(18);
        paint.setColor(Color.argb(72, 185, 137, 76));
        canvas.drawPath(path, paint);
        paint.setStrokeWidth(8);
        paint.setColor(Color.argb(70, 255, 244, 184));
        canvas.drawPath(path, paint);
        paint.setStrokeCap(Paint.Cap.BUTT);
        paint.setStrokeJoin(Paint.Join.MITER);
        paint.setStyle(Paint.Style.FILL);
    }

    private void drawGrassTuft(Canvas canvas, float x, float y) {
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(3);
        paint.setStrokeCap(Paint.Cap.ROUND);
        paint.setColor(Color.argb(115, 74, 145, 80));
        canvas.drawLine(x, y, x - 7, y - 18, paint);
        canvas.drawLine(x + 7, y, x + 5, y - 19, paint);
        canvas.drawLine(x + 14, y, x + 24, y - 15, paint);
        paint.setStrokeCap(Paint.Cap.BUTT);
        paint.setStyle(Paint.Style.FILL);
    }

    private void roundRect(Canvas canvas, float x, float y, float width, float height, float radius, int fill, int stroke) {
        RectF rect = new RectF(x, y, x + width, y + height);
        if (fill != 0) {
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(fill);
            canvas.drawRoundRect(rect, radius, radius, paint);
        }
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

    private void drawWrappedText(Canvas canvas, String text, float x, float y, float maxWidth, float size, int color, float lineHeight) {
        paint.setTextSize(size);
        paint.setTypeface(Typeface.create(Typeface.SANS_SERIF, Typeface.NORMAL));
        paint.setColor(color);
        paint.setTextAlign(Paint.Align.LEFT);
        StringBuilder lineText = new StringBuilder();
        float currentY = y;
        for (int i = 0; i < text.length(); i += 1) {
            char c = text.charAt(i);
            lineText.append(c);
            if (paint.measureText(lineText.toString()) > maxWidth) {
                lineText.deleteCharAt(lineText.length() - 1);
                canvas.drawText(lineText.toString(), x, currentY, paint);
                lineText.setLength(0);
                lineText.append(c);
                currentY += lineHeight;
            }
        }
        if (lineText.length() > 0) canvas.drawText(lineText.toString(), x, currentY, paint);
    }

    private static float clamp(float value, float min, float max) {
        return Math.max(min, Math.min(max, value));
    }

    private static final class Target {
        String type;
        String id = "";
        String label;
        float x;
        float y;
        float radius;
        int index;
        int row;
        int col;
        GameState.Zone zone;
    }
}
