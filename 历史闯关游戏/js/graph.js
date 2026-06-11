/**
 * 知识图谱渲染模块 - 变法风云
 * 重绘版：簇状布局、双向缩放、边界连线与外侧避让通道
 */

(function() {
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const MAIN_CATEGORIES = new Set(['success', 'partial', 'fail']);
    const nodeSizes = {
        main: { width: 148, height: 86 },
        measure: { width: 132, height: 44 }
    };
    const mobileNodeSizes = {
        main: { width: 188, height: 92 },
        measure: { width: 214, height: 52 }
    };

    let graphState = null;
    let cleanupViewportControls = null;

    document.addEventListener('DOMContentLoaded', function() {
        const modeGraphBtn = document.getElementById('mode-graph');
        const graphView = document.getElementById('graph-view');
        const graphBackBtn = document.getElementById('graph-back-home');

        if (modeGraphBtn) {
            modeGraphBtn.addEventListener('click', function() {
                window.setTimeout(initGraph, 100);
            });
        }

        if (graphBackBtn) {
            graphBackBtn.addEventListener('click', function() {
                const splashScreen = document.getElementById('splash-screen');
                hideMobileDetail();
                hideTooltip();
                if (graphView) graphView.classList.add('hidden');
                if (splashScreen) splashScreen.classList.remove('hidden');
            });
        }

        if (graphView && !graphView.classList.contains('hidden')) {
            initGraph();
        }

        window.addEventListener('resize', debounce(function() {
            if (graphState) {
                initGraph();
            }
        }, 180));
    });

    function initGraph() {
        if (!Array.isArray(window.nodes) || !Array.isArray(window.links)) {
            showError('数据加载失败，请刷新页面重试');
            return;
        }

        hideMobileDetail();
        hideTooltip();

        const container = document.getElementById('graph-view');
        const svg = document.getElementById('graph-svg');
        if (!container || !svg) return;

        const width = container.clientWidth;
        const height = container.clientHeight;
        if (!width || !height) return;
        const isMobile = isMobileGraph(width);

        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.replaceChildren();

        const defs = el('defs');
        defs.innerHTML = `
            <filter id="graph-soft-shadow" x="-25%" y="-25%" width="150%" height="150%">
                <feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#2c2416" flood-opacity="0.18"/>
            </filter>
            <marker id="graph-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke"></path>
            </marker>
        `;
        svg.appendChild(defs);

        const viewport = el('g', { class: 'graph-container' });
        svg.appendChild(viewport);

        const state = {
            svg,
            viewport,
            nodes: window.nodes,
            links: window.links,
            width,
            height,
            isMobile,
            transform: getInitialTransform(width, height, isMobile),
            drag: null
        };
        graphState = state;

        const layout = applyResponsiveLayout(state);
        if (isMobile) {
            state.width = layout.width;
            state.height = layout.height;
            svg.setAttribute('width', layout.width);
            svg.setAttribute('height', layout.height);
            svg.setAttribute('viewBox', `0 0 ${layout.width} ${layout.height}`);
            state.transform = getInitialTransform(layout.width, layout.height, isMobile);
        }
        renderGraph(state);
        setupViewportControls(state);
        setupReset(state);
    }

    function isMobileGraph(width) {
        return width <= 768;
    }

    function applyResponsiveLayout(state) {
        return state.isMobile
            ? applyMobileVerticalLayout(state.nodes, state.width)
            : applyDesignedLayout(state.nodes);
    }

    function applyDesignedLayout(nodes) {
        const positions = {
            shangyang: [210, 170],
            xiaowen: [210, 440],
            reform: [210, 710],
            wanganshi: [890, 170],
            zhangjuzheng: [890, 440],
            wuxu: [890, 710]
        };

        Object.entries(positions).forEach(([id, point]) => {
            const node = nodes.find(item => item.id === id);
            if (node && !node._layoutTouched) {
                node.x = point[0];
                node.y = point[1];
            }
        });

        getMainNodes(nodes).forEach(mainNode => {
            const children = getChildren(nodes, mainNode.id);
            const isLeft = mainNode.x < 560;
            const childX = mainNode.x + (isLeft ? 252 : -252);
            const spacing = children.length > 2 ? 62 : 74;
            const startY = mainNode.y - ((children.length - 1) * spacing) / 2;
            children.forEach((child, index) => {
                if (!child._layoutTouched) {
                    child.x = childX;
                    child.y = startY + index * spacing;
                }
            });
        });

        return { width: 1260, height: 850 };
    }

    function applyMobileVerticalLayout(nodes, viewportWidth) {
        const order = ['shangyang', 'xiaowen', 'wanganshi', 'zhangjuzheng', 'wuxu', 'reform'];
        const layoutWidth = Math.max(320, viewportWidth || 390);
        const centerX = layoutWidth / 2;
        const measureXOffset = Math.min(34, Math.max(24, (layoutWidth - mobileNodeSizes.measure.width) / 2 - 20));
        const mainToFirstMeasure = 108;
        const measureSpacing = 74;
        const groupSpacing = 190;
        let cursorY = 116;

        order.forEach(id => {
            const mainNode = nodes.find(item => item.id === id);
            if (!mainNode) return;

            mainNode.x = centerX;
            mainNode.y = cursorY;
            delete mainNode._layoutTouched;

            const children = getChildren(nodes, id);
            children.forEach((child, index) => {
                child.x = centerX + (index % 2 === 0 ? measureXOffset : -measureXOffset);
                child.y = mainNode.y + mainToFirstMeasure + index * measureSpacing;
                delete child._layoutTouched;
            });

            const lastChildY = children.length
                ? children[children.length - 1].y
                : mainNode.y + mobileNodeSizes.main.height / 2;
            cursorY = lastChildY + groupSpacing;
        });

        return {
            width: layoutWidth,
            height: Math.max(cursorY + 140, window.innerHeight || 720)
        };
    }

    function renderGraph(state) {
        const { viewport, nodes, links } = state;
        viewport.replaceChildren();

        const clusters = buildClusters(nodes, state);
        drawClusterBands(viewport, clusters);
        drawMeasureLinks(viewport, nodes, links, state);
        drawCrossLinks(viewport, nodes, links, clusters, state);
        drawNodes(viewport, nodes, state);
        updateTransform(state);
    }

    function buildClusters(nodes, state) {
        return getMainNodes(nodes).map(mainNode => {
            const children = getChildren(nodes, mainNode.id);
            const allNodes = [mainNode, ...children];
            const padX = state.isMobile ? 24 : 30;
            const padY = state.isMobile ? 34 : 28;
            const bounds = allNodes.reduce((box, node) => {
                const size = getNodeSize(node, state);
                return {
                    left: Math.min(box.left, node.x - size.width / 2 - padX),
                    right: Math.max(box.right, node.x + size.width / 2 + padX),
                    top: Math.min(box.top, node.y - size.height / 2 - padY),
                    bottom: Math.max(box.bottom, node.y + size.height / 2 + padY)
                };
            }, { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity });

            bounds.centerX = (bounds.left + bounds.right) / 2;
            bounds.centerY = (bounds.top + bounds.bottom) / 2;
            return { id: mainNode.id, mainNode, children, bounds };
        });
    }

    function drawClusterBands(container, clusters) {
        clusters.forEach(cluster => {
            const rect = el('rect', {
                class: `cluster-band cluster-${cluster.mainNode.category}`,
                x: cluster.bounds.left,
                y: cluster.bounds.top,
                width: cluster.bounds.right - cluster.bounds.left,
                height: cluster.bounds.bottom - cluster.bounds.top,
                rx: 18,
                ry: 18
            });
            container.appendChild(rect);
        });
    }

    function drawMeasureLinks(container, nodes, links, state) {
        const layer = el('g', { class: 'measure-link-layer' });
        container.appendChild(layer);

        links.filter(link => link.type === 'measure').forEach(link => {
            const source = nodes.find(node => node.id === link.source);
            const target = nodes.find(node => node.id === link.target);
            if (!source || !target) return;

            const start = edgePoint(source, target, getNodeSize(source, state));
            const end = edgePoint(target, source, getNodeSize(target, state));
            const d = state.isMobile ? mobileMeasurePath(start, end) : desktopMeasurePath(start, end);

            layer.appendChild(el('path', {
                class: 'link link-measure',
                d,
                fill: 'none',
                'marker-end': 'url(#graph-arrow)'
            }));
        });
    }

    function desktopMeasurePath(start, end) {
        const bend = Math.abs(end.x - start.x) * 0.42;
        const direction = end.x > start.x ? 1 : -1;
        return `M ${start.x} ${start.y} C ${start.x + bend * direction} ${start.y}, ${end.x - bend * direction} ${end.y}, ${end.x} ${end.y}`;
    }

    function mobileMeasurePath(start, end) {
        const midY = start.y + (end.y - start.y) * 0.54;
        return `M ${start.x} ${start.y} C ${start.x} ${midY}, ${end.x} ${midY}, ${end.x} ${end.y}`;
    }

    function drawCrossLinks(container, nodes, links, clusters, state) {
        const layer = el('g', { class: 'cross-link-layer' });
        container.appendChild(layer);

        const clusterById = new Map(clusters.map(cluster => [cluster.id, cluster]));
        const crossLinks = links.filter(link => ['inherit', 'similar', 'contrast'].includes(link.type));

        crossLinks.forEach((link, index) => {
            const sourceCluster = clusterById.get(parentId(nodes, link.source));
            const targetCluster = clusterById.get(parentId(nodes, link.target));
            if (!sourceCluster || !targetCluster) return;

            const route = routedClusterPath(sourceCluster.bounds, targetCluster.bounds, index, state);
            const path = el('path', {
                class: `link link-${link.type}`,
                d: route.d,
                fill: 'none',
                'marker-end': 'url(#graph-arrow)'
            });

            path.addEventListener('mouseenter', event => {
                if (state.isMobile) return;
                if (link.description) showTooltip(link.description, event);
                path.classList.add('is-hovered');
            });
            path.addEventListener('click', event => {
                if (state.isMobile) {
                    showMobileLinkDetail(link);
                    hideTooltip();
                } else if (link.description) {
                    showTooltip(link.description, event);
                }
                path.classList.add('is-hovered');
                event.stopPropagation();
            });
            path.addEventListener('mouseleave', () => {
                if (state.isMobile) return;
                hideTooltip();
                path.classList.remove('is-hovered');
            });

            layer.appendChild(path);
            drawLinkLabel(layer, link, route.label, index, state);
        });
    }

    function routedClusterPath(source, target, index, state) {
        const gap = 38 + (index % 2) * 18;
        const sourceAbove = source.centerY < target.centerY;
        const mobileVertical = state.isMobile && Math.abs(source.centerX - target.centerX) < 90;
        const mostlyVertical = Math.abs(source.centerX - target.centerX) < 170;
        const sameSide = source.centerX < 560 && target.centerX < 560 || source.centerX > 560 && target.centerX > 560;

        if (mobileVertical) {
            const useRightLane = index % 2 === 1;
            const laneX = useRightLane
                ? Math.min(state.width - 18, Math.max(source.right, target.right) + 18)
                : Math.max(18, Math.min(source.left, target.left) - 18);
            const start = { x: useRightLane ? source.right : source.left, y: source.centerY };
            const end = { x: useRightLane ? target.right : target.left, y: target.centerY };
            const d = `M ${start.x} ${start.y} L ${laneX} ${start.y} L ${laneX} ${end.y} L ${end.x} ${end.y}`;
            return { d, label: { x: laneX + (useRightLane ? -8 : 8), y: (start.y + end.y) / 2, anchor: useRightLane ? 'end' : 'start', mobile: true } };
        }

        if (mostlyVertical || sameSide) {
            const leftSide = source.centerX < 560;
            const laneX = leftSide
                ? Math.min(source.left, target.left) - gap
                : Math.max(source.right, target.right) + gap;
            const start = { x: leftSide ? source.left : source.right, y: source.centerY };
            const end = { x: leftSide ? target.left : target.right, y: target.centerY };
            const d = `M ${start.x} ${start.y} L ${laneX} ${start.y} L ${laneX} ${end.y} L ${end.x} ${end.y}`;
            return { d, label: { x: laneX + (leftSide ? -12 : 12), y: (start.y + end.y) / 2, anchor: leftSide ? 'end' : 'start' } };
        }

        const sourceOnLeft = source.centerX < target.centerX;
        const start = { x: sourceOnLeft ? source.right : source.left, y: source.centerY };
        const end = { x: sourceOnLeft ? target.left : target.right, y: target.centerY };
        const laneY = sourceAbove
            ? Math.min(source.top, target.top) - gap
            : Math.max(source.bottom, target.bottom) + gap;
        const d = `M ${start.x} ${start.y} L ${start.x} ${laneY} L ${end.x} ${laneY} L ${end.x} ${end.y}`;
        return { d, label: { x: (start.x + end.x) / 2, y: laneY - 10, anchor: 'middle' } };
    }

    function drawLinkLabel(container, link, point, index, state) {
        const labelGroup = el('g', { class: `link-label-group${state && state.isMobile ? ' is-clickable' : ''}` });
        const title = relationName(link.type);
        const description = link.description || '';
        const label = point.mobile ? title : (description ? `${title}：${description}` : title);
        const lines = wrapText(label, point.mobile ? 9 : 18);
        const width = Math.min(point.mobile ? 142 : 330, Math.max(...lines.map(line => visualLength(line))) * (point.mobile ? 6.8 : 7.2) + 22);
        const lineHeight = point.mobile ? 16 : 18;
        const height = lines.length * lineHeight + 14;
        const x = Math.max(8, point.anchor === 'start' ? point.x : point.anchor === 'end' ? point.x - width : point.x - width / 2);
        const y = point.y - height / 2;

        labelGroup.appendChild(el('rect', {
            class: 'link-label-bg',
            x,
            y,
            width,
            height,
            rx: 8,
            ry: 8
        }));

        lines.forEach((line, lineIndex) => {
            const text = el('text', {
                class: lineIndex === 0 ? 'link-label link-label-emphasis' : 'link-label',
                x: x + width / 2,
                y: y + 17 + lineIndex * lineHeight,
                'text-anchor': 'middle'
            });
            text.textContent = line;
            labelGroup.appendChild(text);
        });

        if (state && state.isMobile) {
            labelGroup.addEventListener('click', event => {
                showMobileLinkDetail(link);
                hideTooltip();
                event.stopPropagation();
            });
        }

        container.appendChild(labelGroup);
    }

    function drawNodes(container, nodes, state) {
        const layer = el('g', { class: 'node-layer' });
        container.appendChild(layer);

        nodes.filter(node => node.category !== 'result').forEach(node => {
            const isMain = MAIN_CATEGORIES.has(node.category);
            const size = getNodeSize(node, state);
            const group = el('g', {
                class: `node-group node-${node.category}`,
                transform: `translate(${node.x}, ${node.y})`,
                'data-id': node.id
            });

            group.appendChild(el('rect', {
                class: isMain ? 'node-card node-card-main' : 'node-card node-card-measure',
                x: -size.width / 2,
                y: -size.height / 2,
                width: size.width,
                height: size.height,
                rx: isMain ? 14 : 10,
                ry: isMain ? 14 : 10
            }));

            if (isMain) {
                appendText(group, node.name, 'node-title', 0, -14);
                if (node.dynasty) appendText(group, node.dynasty, 'node-dynasty', 0, 12);
                if (node.year) appendText(group, node.year, 'node-year', 0, 31);
            } else {
                const lines = wrapText(node.name.replace(/\n/g, ''), state.isMobile ? 8 : 7);
                const firstY = lines.length > 1 ? -9 : 5;
                lines.slice(0, 2).forEach((line, index) => {
                    appendText(group, line, 'node-text', 0, firstY + index * (state.isMobile ? 18 : 17));
                });
            }

            group.addEventListener('mouseenter', event => {
                if (!state.isMobile) showNodeTooltip(node, event);
            });
            group.addEventListener('click', event => {
                if (state.isMobile) {
                    showMobileNodeDetail(node);
                    hideTooltip();
                } else {
                    showNodeTooltip(node, event);
                }
                event.stopPropagation();
            });
            group.addEventListener('mouseleave', () => {
                if (!state.isMobile) hideTooltip();
            });
            if (!state.isMobile) {
                makeDraggable(group, node, state);
            }
            layer.appendChild(group);
        });
    }

    function getNodeSize(node, state) {
        const sizes = state && state.isMobile ? mobileNodeSizes : nodeSizes;
        return MAIN_CATEGORIES.has(node.category) ? sizes.main : sizes.measure;
    }

    function appendText(group, content, className, x, y) {
        const text = el('text', {
            class: className,
            x,
            y,
            'text-anchor': 'middle',
            'dominant-baseline': 'middle'
        });
        text.textContent = content;
        group.appendChild(text);
    }

    function makeDraggable(element, node, state) {
        element.addEventListener('mousedown', function(event) {
            if (event.button !== 0) return;
            const start = screenToWorld(event, state);
            state.drag = {
                node,
                dx: start.x - node.x,
                dy: start.y - node.y
            };
            element.classList.add('is-dragging');
            event.preventDefault();
            event.stopPropagation();
        });
    }

    function setupViewportControls(state) {
        if (cleanupViewportControls) {
            cleanupViewportControls();
            cleanupViewportControls = null;
        }

        const { svg } = state;
        let panning = false;
        let startX = 0;
        let startY = 0;
        let touchMode = null;
        let touchStartDistance = 0;
        let touchStartScale = 1;
        let touchStartCenter = null;
        let touchStartTransform = null;

        const handleMouseDown = function(event) {
            if (state.isMobile) return;
            if (event.button !== 0 || event.target.closest('.node-group')) return;
            panning = true;
            startX = event.clientX - state.transform.x;
            startY = event.clientY - state.transform.y;
            svg.classList.add('is-panning');
            event.preventDefault();
        };

        const handleMouseMove = function(event) {
            if (state.drag) {
                const point = screenToWorld(event, state);
                state.drag.node.x = point.x - state.drag.dx;
                state.drag.node.y = point.y - state.drag.dy;
                state.drag.node._layoutTouched = true;
                renderGraph(state);
                return;
            }

            if (!panning) return;
            state.transform.x = event.clientX - startX;
            state.transform.y = event.clientY - startY;
            updateTransform(state);
        };

        const handleMouseUp = function() {
            state.drag = null;
            panning = false;
            svg.classList.remove('is-panning');
        };

        const handleSvgClick = function(event) {
            if (event.target === svg) {
                hideTooltip();
                hideMobileDetail();
            }
        };

        const handleWheel = function(event) {
            if (state.isMobile) return;
            event.preventDefault();
            const oldScale = state.transform.k;
            const factor = Math.exp(-event.deltaY * 0.0012);
            const newScale = clamp(oldScale * factor, 0.45, 1.85);
            const rect = svg.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            const worldX = (mouseX - state.transform.x) / oldScale;
            const worldY = (mouseY - state.transform.y) / oldScale;

            state.transform.k = newScale;
            state.transform.x = mouseX - worldX * newScale;
            state.transform.y = mouseY - worldY * newScale;
            updateTransform(state);
        };

        const touchPoint = function(touch) {
            const rect = svg.getBoundingClientRect();
            return {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top
            };
        };

        const touchDistance = function(touches) {
            const first = touchPoint(touches[0]);
            const second = touchPoint(touches[1]);
            return Math.hypot(second.x - first.x, second.y - first.y);
        };

        const touchCenter = function(touches) {
            const first = touchPoint(touches[0]);
            const second = touchPoint(touches[1]);
            return {
                x: (first.x + second.x) / 2,
                y: (first.y + second.y) / 2
            };
        };

        const handleTouchStart = function(event) {
            if (event.touches.length === 1) {
                if (state.isMobile) return;
                touchMode = 'pan';
                const point = touchPoint(event.touches[0]);
                startX = point.x - state.transform.x;
                startY = point.y - state.transform.y;
                svg.classList.add('is-panning');
            } else if (event.touches.length === 2) {
                touchMode = 'zoom';
                touchStartDistance = touchDistance(event.touches);
                touchStartScale = state.transform.k;
                touchStartCenter = touchCenter(event.touches);
                touchStartTransform = { ...state.transform };
                if (state.isMobile) {
                    svg.classList.add('is-panning');
                }
                event.preventDefault();
            }
        };

        const handleTouchMove = function(event) {
            if (touchMode === 'pan' && event.touches.length === 1) {
                const point = touchPoint(event.touches[0]);
                state.transform.x = point.x - startX;
                state.transform.y = point.y - startY;
                updateTransform(state);
            } else if (touchMode === 'zoom' && event.touches.length === 2) {
                const center = touchCenter(event.touches);
                const newScale = clamp(touchStartScale * (touchDistance(event.touches) / touchStartDistance), 0.32, 2);
                const worldX = (touchStartCenter.x - touchStartTransform.x) / touchStartTransform.k;
                const worldY = (touchStartCenter.y - touchStartTransform.y) / touchStartTransform.k;

                state.transform.k = newScale;
                state.transform.x = center.x - worldX * newScale;
                state.transform.y = center.y - worldY * newScale;
                updateTransform(state);
                event.preventDefault();
            }
        };

        const handleTouchEnd = function(event) {
            if (!svg) return;
            if (!event.touches || event.touches.length === 0) {
                touchMode = null;
                svg.classList.remove('is-panning');
            }
        };

        svg.addEventListener('mousedown', handleMouseDown);
        svg.addEventListener('click', handleSvgClick);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        svg.addEventListener('wheel', handleWheel, { passive: false });
        svg.addEventListener('touchstart', handleTouchStart, { passive: false });
        svg.addEventListener('touchmove', handleTouchMove, { passive: false });
        svg.addEventListener('touchend', handleTouchEnd);
        svg.addEventListener('touchcancel', handleTouchEnd);

        cleanupViewportControls = function() {
            svg.removeEventListener('mousedown', handleMouseDown);
            svg.removeEventListener('click', handleSvgClick);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            svg.removeEventListener('wheel', handleWheel);
            svg.removeEventListener('touchstart', handleTouchStart);
            svg.removeEventListener('touchmove', handleTouchMove);
            svg.removeEventListener('touchend', handleTouchEnd);
            svg.removeEventListener('touchcancel', handleTouchEnd);
        };
    }

    function setupReset(state) {
        const resetBtn = document.getElementById('reset-view');
        if (!resetBtn) return;
        resetBtn.onclick = function() {
            hideMobileDetail();
            state.nodes.forEach(node => delete node._layoutTouched);
            const layout = applyResponsiveLayout(state);
            if (state.isMobile) {
                state.width = layout.width;
                state.height = layout.height;
                state.svg.setAttribute('width', layout.width);
                state.svg.setAttribute('height', layout.height);
                state.svg.setAttribute('viewBox', `0 0 ${layout.width} ${layout.height}`);
            }
            state.transform = getInitialTransform(state.width, state.height, state.isMobile);
            renderGraph(state);
        };
    }

    function updateTransform(state) {
        const { x, y, k } = state.transform;
        state.viewport.setAttribute('transform', `translate(${x}, ${y}) scale(${k})`);
    }

    function getInitialTransform(width, height, isMobile = isMobileGraph(width)) {
        const graphWidth = 1260;
        const graphHeight = 850;
        if (isMobile) {
            return { k: 1, x: 0, y: 0 };
        }
        const minScale = 0.62;
        const maxScale = 1.18;
        const xPad = 40;
        const yPad = 72;
        const k = clamp(Math.min((width - xPad) / graphWidth, (height - yPad) / graphHeight), minScale, maxScale);
        return {
            k,
            x: (width - graphWidth * k) / 2,
            y: (height - graphHeight * k) / 2 + 32
        };
    }

    function edgePoint(node, towardNode, size) {
        const dx = towardNode.x - node.x;
        const dy = towardNode.y - node.y;
        const halfW = size.width / 2;
        const halfH = size.height / 2;

        if (Math.abs(dx) / halfW > Math.abs(dy) / halfH) {
            return { x: node.x + Math.sign(dx || 1) * halfW, y: node.y + dy * (halfW / Math.abs(dx || 1)) };
        }

        return { x: node.x + dx * (halfH / Math.abs(dy || 1)), y: node.y + Math.sign(dy || 1) * halfH };
    }

    function screenToWorld(event, state) {
        const rect = state.svg.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left - state.transform.x) / state.transform.k,
            y: (event.clientY - rect.top - state.transform.y) / state.transform.k
        };
    }

    function showNodeTooltip(node, event) {
        let content = `<div class="tooltip-title">${escapeHtml(node.name)}</div>`;
        if (node.dynasty) {
            content += `<div class="tooltip-dynasty">${escapeHtml(node.dynasty)} · ${escapeHtml(node.year || '')}</div>`;
        }
        if (node.description) {
            content += `<div class="tooltip-desc">${escapeHtml(node.description)}</div>`;
        }
        if (MAIN_CATEGORIES.has(node.category) && node.result) {
            content += `<div class="tooltip-result"><strong>改革影响：</strong>${escapeHtml(node.result)}</div>`;
        }
        showTooltip(content, event);
    }

    function showMobileNodeDetail(node) {
        const title = escapeHtml(node.name || '知识点');
        const metaParts = [node.dynasty, node.year].filter(Boolean).map(escapeHtml);
        let body = '';

        if (metaParts.length) {
            body += `<div class="mobile-detail-meta">${metaParts.join(' · ')}</div>`;
        }
        if (node.description) {
            body += `<p>${escapeHtml(node.description)}</p>`;
        }
        if (MAIN_CATEGORIES.has(node.category) && node.result) {
            body += `<div class="mobile-detail-result"><strong>改革影响：</strong>${escapeHtml(node.result)}</div>`;
        }
        if (!body) {
            body = '<p>暂无详细说明。</p>';
        }

        showMobileDetail(title, body);
    }

    function showMobileLinkDetail(link) {
        const title = `${relationName(link.type)}关系`;
        const source = graphState && graphState.nodes.find(node => node.id === link.source);
        const target = graphState && graphState.nodes.find(node => node.id === link.target);
        const names = [source && source.name, target && target.name].filter(Boolean).map(escapeHtml);
        let body = '';

        if (names.length === 2) {
            body += `<div class="mobile-detail-meta">${names[0]} → ${names[1]}</div>`;
        }
        body += `<p>${escapeHtml(link.description || '暂无关系说明。')}</p>`;

        showMobileDetail(title, body);
    }

    function showMobileDetail(title, body) {
        const graphView = document.getElementById('graph-view');
        if (!graphView) return;

        let card = document.getElementById('graph-mobile-detail');
        if (!card) {
            card = document.createElement('section');
            card.id = 'graph-mobile-detail';
            card.className = 'graph-mobile-detail';
            card.setAttribute('aria-live', 'polite');
            graphView.appendChild(card);
        }

        card.innerHTML = `
            <div class="mobile-detail-head">
                <h3>${title}</h3>
                <button type="button" class="mobile-detail-close" aria-label="关闭详情">×</button>
            </div>
            <div class="mobile-detail-body">${body}</div>
        `;
        card.querySelector('.mobile-detail-close').addEventListener('click', hideMobileDetail);
        graphView.classList.add('has-mobile-detail');
    }

    function hideMobileDetail() {
        const graphView = document.getElementById('graph-view');
        const card = document.getElementById('graph-mobile-detail');
        if (card) card.remove();
        if (graphView) graphView.classList.remove('has-mobile-detail');
    }

    function showTooltip(content, event) {
        let tooltip = document.getElementById('graph-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'graph-tooltip';
            tooltip.className = 'graph-tooltip';
            document.body.appendChild(tooltip);
        }

        tooltip.innerHTML = content;
        tooltip.style.display = 'block';
        moveTooltip(tooltip, event);
    }

    function moveTooltip(tooltip, event) {
        const margin = 18;
        const x = Math.min(event.clientX + margin, window.innerWidth - tooltip.offsetWidth - margin);
        const y = Math.min(event.clientY + margin, window.innerHeight - tooltip.offsetHeight - margin);
        tooltip.style.left = `${Math.max(margin, x)}px`;
        tooltip.style.top = `${Math.max(margin, y)}px`;
    }

    function hideTooltip() {
        const tooltip = document.getElementById('graph-tooltip');
        if (tooltip) tooltip.style.display = 'none';
    }

    function showError(message) {
        const svg = document.getElementById('graph-svg');
        if (!svg) return;
        svg.replaceChildren();
        const text = el('text', {
            x: '50%',
            y: '50%',
            'text-anchor': 'middle',
            fill: '#8b4513',
            'font-size': 18,
            'font-weight': 700
        });
        text.textContent = message;
        svg.appendChild(text);
    }

    function getMainNodes(nodes) {
        return nodes.filter(node => MAIN_CATEGORIES.has(node.category));
    }

    function getChildren(nodes, parent) {
        return nodes.filter(node => node.parent === parent && node.category === 'measure');
    }

    function parentId(nodes, nodeId) {
        const node = nodes.find(item => item.id === nodeId);
        return node && node.parent ? node.parent : nodeId;
    }

    function relationName(type) {
        return {
            inherit: '传承',
            similar: '相似',
            contrast: '对比'
        }[type] || '关系';
    }

    function wrapText(text, maxChars) {
        const clean = String(text || '').replace(/\s+/g, '');
        if (clean.length <= maxChars) return [clean];
        const lines = [];
        for (let index = 0; index < clean.length; index += maxChars) {
            lines.push(clean.slice(index, index + maxChars));
        }
        return lines;
    }

    function visualLength(text) {
        return Array.from(text).reduce((total, char) => total + (char.charCodeAt(0) > 255 ? 1.8 : 1), 0);
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char]));
    }

    function el(tagName, attrs = {}) {
        const element = document.createElementNS(SVG_NS, tagName);
        Object.entries(attrs).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        return element;
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function debounce(fn, wait) {
        let timer = null;
        return function(...args) {
            window.clearTimeout(timer);
            timer = window.setTimeout(() => fn.apply(this, args), wait);
        };
    }

    window.initGraph = initGraph;
})();
