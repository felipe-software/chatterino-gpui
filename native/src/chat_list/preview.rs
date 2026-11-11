use std::sync::Arc;
use std::time::Instant;

use gpui::{
    App, BorderStyle, Bounds, ContentMask, Corners, Hsla, LineLayout, PathBuilder, Pixels, Point,
    Window, point, px, quad, size,
};

use super::frames;
use super::images::{self, LoadedImage};
use super::layout::{PreviewBadge, PreviewBox};
use super::model::{ChatListOptions, PreviewKind};

const STRIPE_WIDTH: f32 = 12.0;
const ICON_SCALE: f32 = 0.44;
const ARC_SEGMENTS: usize = 6;

#[derive(Clone, Copy)]
pub struct PreviewColors {
    pub background: Hsla,
    pub border: Hsla,
    pub hover_border: Hsla,
    pub stripe: Hsla,
    pub stripe_alt: Hsla,
    pub text: Hsla,
    pub muted: Hsla,
    pub overlay: Hsla,
    pub overlay_text: Hsla,
}

impl PreviewColors {
    pub fn resolve(options: &ChatListOptions, text: Hsla, muted: Hsla) -> Self {
        Self {
            background: options.preview_background.unwrap_or(text.opacity(0.05)),
            border: options.preview_border.unwrap_or(text.opacity(0.12)),
            hover_border: options.preview_hover_border.unwrap_or(text.opacity(0.3)),
            stripe: options.preview_stripe.unwrap_or(text.opacity(0.06)),
            stripe_alt: options.preview_stripe_alt.unwrap_or(text.opacity(0.1)),
            text,
            muted,
            overlay: gpui::rgba(0x090b0fc7).into(),
            overlay_text: gpui::rgba(0xe8e9edff).into(),
        }
    }
}

#[derive(Default)]
pub struct PreviewPaint {
    pub image: bool,
    pub wake: Option<Instant>,
}

#[allow(clippy::too_many_arguments)]
pub fn paint_preview(
    card: &PreviewBox,
    origin: Point<Pixels>,
    colors: &PreviewColors,
    hovered: bool,
    animate: bool,
    now: Instant,
    window: &mut Window,
    cx: &mut App,
) -> PreviewPaint {
    let mut outcome = PreviewPaint::default();
    let card_bounds = Bounds::new(
        origin + point(px(card.x), px(card.y)),
        size(px(card.width), px(card.height)),
    );
    let border = if hovered {
        colors.hover_border
    } else {
        colors.border
    };
    window.paint_quad(quad(
        card_bounds,
        px(card.radius),
        colors.background,
        px(card.border),
        border,
        BorderStyle::Solid,
    ));

    let (media_x, media_y, media_width, media_height) = card.media();
    let media = Bounds::new(
        origin + point(px(media_x), px(media_y)),
        size(px(media_width), px(media_height)),
    );
    let inner_radius = (card.radius - card.border).max(0.0);
    let media_radii = Corners {
        top_left: px(inner_radius),
        top_right: px(inner_radius),
        bottom_left: px(0.0),
        bottom_right: px(0.0),
    };
    window.paint_quad(quad(
        media,
        media_radii,
        colors.stripe,
        px(0.0),
        colors.stripe,
        BorderStyle::Solid,
    ));

    let loaded = media_image(card, now, window, cx);
    match loaded {
        Some(loaded) => {
            outcome.image = true;
            let animated = animate && card.preview.kind == PreviewKind::Image;
            let (frame, wake) = loaded.frame_at(now, animated);
            outcome.wake = wake;
            let cover = card.preview.kind == PreviewKind::YouTube;
            let fitted = fit(media, &loaded, frame, cover);
            let mask = ContentMask {
                bounds: media,
                corner_radii: media_radii,
            };
            window.with_content_mask(Some(mask), |window| {
                let _ = window.paint_image(
                    fitted,
                    Corners::default(),
                    loaded.data.clone(),
                    frame,
                    false,
                );
            });
        }
        None => paint_stripes(media, inner_radius, card.scale, colors.stripe_alt, window),
    }

    window.paint_layer(media, |window| {
        if let Some(badge) = card.badge.as_ref() {
            paint_badge(badge, origin, colors, window);
        }
        if card.play > 0.0 {
            paint_play(media, card.play, colors, window);
        }
    });
    for text in &card.footer {
        let color = if text.muted {
            colors.muted
        } else {
            colors.text
        };
        paint_line(
            &text.layout,
            origin.x + px(text.x),
            origin.y + px(text.baseline),
            color,
            window,
        );
    }
    outcome
}

fn media_image(
    card: &PreviewBox,
    now: Instant,
    window: &mut Window,
    cx: &mut App,
) -> Option<Arc<LoadedImage>> {
    let url = match (&card.preview.image, &card.preview.video) {
        (Some(image), _) => image.clone(),
        (None, Some(video)) => frames::frame(video, window, cx)?,
        (None, None) => return None,
    };
    images::image(&url, now, window, cx)
}

fn fit(media: Bounds<Pixels>, loaded: &LoadedImage, frame: usize, cover: bool) -> Bounds<Pixels> {
    let natural = loaded.data.size(frame);
    let natural_width = (natural.width.0 as f32).max(1.0);
    let natural_height = (natural.height.0 as f32).max(1.0);
    let box_width = f32::from(media.size.width);
    let box_height = f32::from(media.size.height);
    let width_ratio = box_width / natural_width;
    let height_ratio = box_height / natural_height;
    let ratio = if cover {
        width_ratio.max(height_ratio)
    } else {
        width_ratio.min(height_ratio)
    };
    let width = natural_width * ratio;
    let height = natural_height * ratio;
    let x = f32::from(media.origin.x) + (box_width - width) / 2.0;
    let y = f32::from(media.origin.y) + (box_height - height) / 2.0;
    Bounds::new(point(px(x), px(y)), size(px(width), px(height)))
}

fn paint_badge(
    badge: &PreviewBadge,
    origin: Point<Pixels>,
    colors: &PreviewColors,
    window: &mut Window,
) {
    let bounds = Bounds::new(
        origin + point(px(badge.x), px(badge.y)),
        size(px(badge.width), px(badge.height)),
    );
    window.paint_quad(quad(
        bounds,
        px(badge.radius),
        colors.overlay,
        px(0.0),
        colors.overlay,
        BorderStyle::Solid,
    ));
    let text_width = f32::from(badge.layout.width);
    let text_x = badge.x + (badge.width - text_width) / 2.0;
    paint_line(
        &badge.layout,
        origin.x + px(text_x),
        origin.y + px(badge.baseline),
        colors.overlay_text,
        window,
    );
}

fn paint_play(media: Bounds<Pixels>, diameter: f32, colors: &PreviewColors, window: &mut Window) {
    let center = media.center();
    let half = px(diameter / 2.0);
    let circle = Bounds::new(
        point(center.x - half, center.y - half),
        size(px(diameter), px(diameter)),
    );
    window.paint_quad(quad(
        circle,
        half,
        colors.overlay,
        px(0.0),
        colors.overlay,
        BorderStyle::Solid,
    ));
    let icon = diameter * ICON_SCALE;
    let unit = icon / 24.0;
    let left = f32::from(center.x) - icon / 2.0;
    let top = f32::from(center.y) - icon / 2.0;
    let at = |x: f32, y: f32| point(px(left + x * unit), px(top + y * unit));
    let mut builder = PathBuilder::fill();
    builder.move_to(at(8.0, 5.5));
    builder.line_to(at(8.0, 18.5));
    builder.line_to(at(19.0, 12.0));
    builder.close();
    if let Ok(path) = builder.build() {
        window.paint_path(path, colors.overlay_text);
    }
}

fn paint_line(layout: &LineLayout, x: Pixels, baseline: Pixels, color: Hsla, window: &mut Window) {
    let font_size = layout.font_size;
    for run in layout.runs.iter() {
        for glyph in run.glyphs.iter() {
            let origin = point(x + glyph.position.x, baseline);
            let _ = if glyph.is_emoji {
                window.paint_emoji(origin, run.font_id, glyph.id, font_size)
            } else {
                window.paint_glyph(origin, run.font_id, glyph.id, font_size, color)
            };
        }
    }
}

type Polygon = Vec<(f32, f32)>;

fn rounded_top_rect(width: f32, height: f32, radius: f32) -> Polygon {
    let radius = radius.min(width / 2.0).min(height);
    let mut points = Vec::with_capacity(ARC_SEGMENTS * 2 + 4);
    let corners = [
        (radius, radius, std::f32::consts::PI),
        (width - radius, radius, std::f32::consts::PI * 1.5),
    ];
    for (center_x, center_y, start) in corners {
        for step in 0..=ARC_SEGMENTS {
            let angle = start + std::f32::consts::FRAC_PI_2 * step as f32 / ARC_SEGMENTS as f32;
            points.push((
                center_x + radius * angle.cos(),
                center_y + radius * angle.sin(),
            ));
        }
    }
    points.push((width, height));
    points.push((0.0, height));
    points
}

fn cross(a: (f32, f32), b: (f32, f32), p: (f32, f32)) -> f32 {
    (b.0 - a.0) * (p.1 - a.1) - (b.1 - a.1) * (p.0 - a.0)
}

fn signed_area(polygon: &[(f32, f32)]) -> f32 {
    let mut area = 0.0;
    for (index, a) in polygon.iter().enumerate() {
        let b = polygon[(index + 1) % polygon.len()];
        area += a.0 * b.1 - b.0 * a.1;
    }
    area / 2.0
}

fn clip_convex(subject: Polygon, clip: &[(f32, f32)]) -> Polygon {
    let orientation = signed_area(clip).signum();
    let mut output = subject;
    for (index, &a) in clip.iter().enumerate() {
        if output.is_empty() {
            break;
        }
        let b = clip[(index + 1) % clip.len()];
        let inside = |p: (f32, f32)| cross(a, b, p) * orientation >= 0.0;
        let input = std::mem::take(&mut output);
        for (point_index, &current) in input.iter().enumerate() {
            let previous = input[(point_index + input.len() - 1) % input.len()];
            let current_inside = inside(current);
            if current_inside != inside(previous) {
                output.push(intersection(previous, current, a, b));
            }
            if current_inside {
                output.push(current);
            }
        }
    }
    output
}

fn intersection(p: (f32, f32), q: (f32, f32), a: (f32, f32), b: (f32, f32)) -> (f32, f32) {
    let denominator = (p.0 - q.0) * (a.1 - b.1) - (p.1 - q.1) * (a.0 - b.0);
    if denominator.abs() < f32::EPSILON {
        return q;
    }
    let t = ((p.0 - a.0) * (a.1 - b.1) - (p.1 - a.1) * (a.0 - b.0)) / denominator;
    (p.0 + t * (q.0 - p.0), p.1 + t * (q.1 - p.1))
}

fn stripe_polygons(width: f32, height: f32, radius: f32, scale: f32) -> Vec<Polygon> {
    let clip = rounded_top_rect(width, height, radius);
    let period = STRIPE_WIDTH * 2.0 * scale * std::f32::consts::SQRT_2;
    let top = -1.0;
    let bottom = height + 1.0;
    let mut polygons = Vec::new();
    let mut start = period / 2.0;
    while start < width + height {
        let end = start + period / 2.0;
        let band = vec![
            (start - top, top),
            (end - top, top),
            (end - bottom, bottom),
            (start - bottom, bottom),
        ];
        let clipped = clip_convex(band, &clip);
        if clipped.len() >= 3 {
            polygons.push(clipped);
        }
        start += period;
    }
    polygons
}

fn paint_stripes(media: Bounds<Pixels>, radius: f32, scale: f32, color: Hsla, window: &mut Window) {
    let width = f32::from(media.size.width);
    let height = f32::from(media.size.height);
    let left = f32::from(media.origin.x);
    let top = f32::from(media.origin.y);
    for polygon in stripe_polygons(width, height, radius, scale) {
        let mut builder = PathBuilder::fill();
        let mut corners = polygon.iter();
        let Some(&(x, y)) = corners.next() else {
            continue;
        };
        builder.move_to(point(px(left + x), px(top + y)));
        for &(x, y) in corners {
            builder.line_to(point(px(left + x), px(top + y)));
        }
        builder.close();
        if let Ok(path) = builder.build() {
            window.paint_path(path, color);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn inside_rounded(width: f32, height: f32, radius: f32, (x, y): (f32, f32)) -> bool {
        let slack = 0.75;
        if x < -slack || y < -slack || x > width + slack || y > height + slack {
            return false;
        }
        let corner_x = if x < radius {
            Some(radius)
        } else if x > width - radius {
            Some(width - radius)
        } else {
            None
        };
        match corner_x {
            Some(center_x) if y < radius => {
                let distance = ((x - center_x).powi(2) + (y - radius).powi(2)).sqrt();
                distance <= radius + slack
            }
            _ => true,
        }
    }

    #[test]
    fn stripes_stay_inside_the_rounded_media() {
        let (width, height, radius) = (298.0, 168.0, 7.0);
        let polygons = stripe_polygons(width, height, radius, 1.0);
        assert!(polygons.len() > 8);
        for polygon in &polygons {
            for &corner in polygon {
                assert!(inside_rounded(width, height, radius, corner), "{corner:?}");
            }
        }
    }

    #[test]
    fn stripes_alternate_every_twelve_pixels() {
        let polygons = stripe_polygons(100.0, 100.0, 0.0, 1.0);
        let first = &polygons[0];
        let sums: Vec<f32> = first.iter().map(|(x, y)| x + y).collect();
        let low = sums.iter().cloned().fold(f32::MAX, f32::min);
        let high = sums.iter().cloned().fold(f32::MIN, f32::max);
        let half_period = 12.0 * std::f32::consts::SQRT_2;
        assert!((low - half_period).abs() < 0.01);
        assert!((high - half_period * 2.0).abs() < 0.01);
    }
}
