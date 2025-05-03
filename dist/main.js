"use strict";
// Safe querySelectorAll function with error handling
function safTSQuerySelectorAll(selector) {
    try {
        return Array.from(document.querySelectorAll(selector));
    }
    catch (e) {
        const error = e;
        throw new Error(`TSQuery Error: Failed to parse selector "${selector}".\nReason: ${error.message}`);
    }
}
// The main $ function, which mimics jQuery's basic DOM manipulation behavior
function $(selector) {
    let elements;
    // If selector is a string, use querySelectorAll to find elements
    if (typeof selector === 'string') {
        elements = safTSQuerySelectorAll(selector);
    }
    else if (selector instanceof HTMLElement) {
        // If it's a single HTMLElement, wrap it in an array
        elements = [selector];
    }
    else if (Array.isArray(selector)) {
        // If it's an array of HTMLElements, use it directly
        elements = selector;
    }
    else {
        throw new Error(`TSQuery Error: Invalid selector type. Expected string, HTMLElement, or HTMLElement[].`);
    }
    // Create the TSQuery instance with the methods for DOM manipulation
    const instance = {
        elements,
        // forEach method to iterate over elements and execute the callback
        forEach(callback) {
            this.elements.forEach(callback);
        },
        // each method that allows chaining, iterates over elements
        each(callback) {
            this.elements.forEach((el, index) => callback(el, index));
            return this;
        },
        // css method to set CSS styles, either a single property or multiple properties
        css(propertyOrProperties, value) {
            if (typeof propertyOrProperties === 'string') {
                // If a single CSS property is provided
                this.elements.forEach((el) => {
                    el.style[propertyOrProperties] = value;
                });
            }
            else {
                // If multiple CSS properties are provided
                for (const prop in propertyOrProperties) {
                    const val = propertyOrProperties[prop];
                    this.elements.forEach((el) => {
                        el.style[prop] = val;
                    });
                }
            }
            return this;
        },
        // addClass method to add a class to selected elements
        addClass(className) {
            this.elements.forEach((el) => el.classList.add(className));
            return this;
        },
        // removeClass method to remove a class from selected elements
        removeClass(className) {
            this.elements.forEach((el) => el.classList.remove(className));
            return this;
        },
        // setAttr method to set an attribute on selected elements
        setAttr(name, value) {
            this.elements.forEach((el) => el.setAttribute(name, value));
            return this;
        },
        // getAttr method to retrieve the value of an attribute from the first element
        getAttr(name) {
            var _a;
            return ((_a = this.elements[0]) === null || _a === void 0 ? void 0 : _a.getAttribute(name)) || '';
        },
        // html method to get or set the innerHTML of selected elements
        html(htmlString) {
            var _a;
            if (htmlString === undefined) {
                return ((_a = this.elements[0]) === null || _a === void 0 ? void 0 : _a.innerHTML) || '';
            }
            this.elements.forEach((el) => el.innerHTML = htmlString);
            return this;
        },
        // on method to attach event listeners to elements, with event delegation support
        on(events, selectorOrHandler, handlerOrOptions, options) {
            const eventList = events.split(/\s+/);
            if (typeof selectorOrHandler === 'function') {
                this.forEach((el) => {
                    eventList.forEach(event => {
                        el.addEventListener(event, function (e) {
                            const clickedElement = e.target;
                            selectorOrHandler.call(clickedElement, e);
                        }.bind(this), handlerOrOptions);
                    });
                });
            }
            else if (typeof selectorOrHandler === 'string' && typeof handlerOrOptions === 'function') {
                this.forEach((el) => {
                    eventList.forEach(event => {
                        el.addEventListener(event, function (e) {
                            const target = e.target;
                            const potentialMatch = target.closest(selectorOrHandler);
                            if (potentialMatch && el.contains(potentialMatch)) {
                                handlerOrOptions.call(potentialMatch, e);
                            }
                        }.bind(this), options);
                    });
                });
            }
            return this;
        },
        // find method to search for child elements that match a given selector
        find(selector) {
            const foundElements = [];
            this.elements.forEach((el) => {
                foundElements.push(...Array.from(el.querySelectorAll(selector)));
            });
            return $(foundElements);
        },
        // children method to get child elements of selected elements
        children() {
            const childElements = [];
            this.elements.forEach((el) => {
                Array.from(el.children).forEach((child) => {
                    childElements.push(child);
                });
            });
            return $(childElements);
        },
        // parent method to get the parent of each selected element
        parent() {
            const parentElements = [];
            this.elements.forEach((el) => {
                const parent = el.parentElement;
                if (parent && parent instanceof HTMLElement) {
                    parentElements.push(parent);
                }
            });
            return $(parentElements);
        },
        // parents method to get ancestors of each selected element
        parents(selector) {
            const parentElements = [];
            this.elements.forEach((el) => {
                let parent = el.parentElement;
                while (parent) {
                    if (parent instanceof HTMLElement) {
                        // If a selector is provided, check if the parent matches it
                        if (selector && parent.matches(selector)) {
                            parentElements.push(parent);
                            break;
                        }
                        else if (!selector) {
                            // Add all parents if no selector
                            parentElements.push(parent);
                        }
                    }
                    parent = parent.parentElement;
                }
            });
            return $(parentElements);
        },
        // siblings method to get siblings of each selected element
        siblings(selector) {
            const siblingElements = [];
            this.elements.forEach((el) => {
                const parent = el.parentElement;
                if (parent) {
                    Array.from(parent.children).forEach((sibling) => {
                        if (sibling !== el && sibling instanceof HTMLElement) {
                            if (selector && sibling.matches(selector)) {
                                siblingElements.push(sibling);
                            }
                            else if (!selector) {
                                siblingElements.push(sibling);
                            }
                        }
                    });
                }
            });
            return $(siblingElements);
        },
        // next method to get the next sibling of each selected element
        next(selector) {
            const nextElements = [];
            this.elements.forEach((el) => {
                let nextSibling = el.nextElementSibling;
                while (nextSibling) {
                    if (nextSibling instanceof HTMLElement) {
                        if (selector && nextSibling.matches(selector)) {
                            nextElements.push(nextSibling);
                            break;
                        }
                        else if (!selector) {
                            nextElements.push(nextSibling);
                            break;
                        }
                    }
                    nextSibling = nextSibling.nextElementSibling;
                }
            });
            return $(nextElements);
        },
        // prev method to get the previous sibling of each selected element
        prev(selector) {
            const prevElements = [];
            this.elements.forEach((el) => {
                let prevSibling = el.previousElementSibling;
                while (prevSibling) {
                    if (prevSibling instanceof HTMLElement) {
                        if (selector && prevSibling.matches(selector)) {
                            prevElements.push(prevSibling);
                            break;
                        }
                        else if (!selector) {
                            prevElements.push(prevSibling);
                            break;
                        }
                    }
                    prevSibling = prevSibling.previousElementSibling;
                }
            });
            return $(prevElements);
        },
        // closest method to get the nearest ancestor of each selected element
        closest(selector) {
            const closestElements = [];
            this.elements.forEach((el) => {
                let parent = el; // Start from the element itself
                // Traverse up the ancestors
                while (parent) {
                    if (parent.matches(selector)) {
                        closestElements.push(parent);
                        break; // Stop at the first matching ancestor
                    }
                    parent = parent.parentElement; // Move to the parent element
                }
            });
            return $(closestElements); // Return TSQuery instance with matched ancestors
        },
        // first method to get the first element of each selected element
        first(selector) {
            const firstElements = this.elements.map((el) => {
                // Get the children of the element and filter them by the provided selector
                const children = Array.from(el.children);
                const filteredChildren = selector ? children.filter(child => child.matches(selector)) : children;
                // Return the first filtered child (if any), or null if no match
                return filteredChildren.length > 0 ? filteredChildren[0] : null;
            }).filter(Boolean);
            return $(firstElements);
        },
        // last method to get the last element of each selected element
        last(selector) {
            const lastElements = this.elements.map((el) => {
                // Get the children of the element and filter them by the provided selector
                const children = Array.from(el.children);
                const filteredChildren = selector ? children.filter(child => child.matches(selector)) : children;
                // Return the last filtered child (if any), or null if no match
                return filteredChildren.length > 0 ? filteredChildren[filteredChildren.length - 1] : null;
            }).filter(Boolean);
            return $(lastElements);
        },
        // has method to check whether a specific element is a descendant of any of the selected elements
        has(selector) {
            const filteredElements = this.elements.filter((el) => {
                // Check if the element contains the selector
                return el.querySelector(selector) !== null;
            });
            return $(filteredElements);
        },
        // Filter method to  filter out elements from a collection based on a provided condition or function
        filter(callback) {
            const filteredElements = this.elements.filter((el, index) => {
                // Apply the callback function to each element
                return callback(el, index);
            });
            return $(filteredElements);
        },
        // Filter method to get an element at a specific index in the current collection of elements
        eq(index) {
            // Ensure index is within the bounds of the elements array
            const element = this.elements[index >= 0 ? index : this.elements.length + index];
            // Return a new TSQuery instance with a single element at the specified index
            return $(element ? [element] : []);
        },
        // Filter method to exclude certain elements from the set of selected elements
        not(selector) {
            let filteredElements;
            if (typeof selector === 'string') {
                // Filter out elements that match the given selector
                filteredElements = this.elements.filter(el => !el.matches(selector));
            }
            else if (typeof selector === 'function') {
                // Filter out elements that return true from the callback function
                filteredElements = this.elements.filter(el => !selector(el));
            }
            else {
                filteredElements = [];
            }
            return $(filteredElements);
        },
        // Toggle method to toggle a class of selected elements
        toggleClass(selector) {
            this.elements.forEach((el) => {
                el.classList.toggle(selector);
            });
            return this;
        },
        // set or get the text content of selected elements
        text(selector) {
            if (selector === undefined || selector.trim() === '') {
                let combinedText = '';
                this.elements.forEach((el) => {
                    var _a;
                    combinedText += ((_a = el.textContent) !== null && _a !== void 0 ? _a : '').trim();
                });
                return combinedText;
            }
            else {
                this.elements.forEach((el) => {
                    el.textContent = selector;
                });
                return this;
            }
        },
        // set or get the value of form elements (input, textarea, select)
        val(value) {
            if (value === undefined) {
                const firstElement = this.elements[0];
                if (firstElement && 'value' in firstElement) {
                    return firstElement.value;
                }
                return '';
            }
            else {
                this.elements.forEach((el) => {
                    if ('value' in el) {
                        el.value = value;
                    }
                });
                return this;
            }
        },
        // Animate method to handle CSS transitions
        // This method allows for smooth transitions of CSS properties over a specified duration
        // It supports easing functions and a callback to be executed after the animation completes
        //No tranform properties are supported yet
        animate(properties, duration = 400, easing = (t) => t, callback) {
            const queueKey = '__TSQuery_animate_queue__';
            this.forEach((el) => {
                if (!(queueKey in el))
                    el[queueKey] = [];
                const queue = el[queueKey];
                queue.push(() => {
                    var _a;
                    const startTime = performance.now();
                    const startStyles = {};
                    const endStyles = {};
                    const units = {};
                    for (const prop in properties) {
                        const computed = getComputedStyle(el)[prop];
                        const targetVal = (properties[prop] || '').toString().trim();
                        const isNumeric = /^-?\d+(\.\d+)?([a-z%]*)?$/.test(targetVal);
                        const targetColor = parseColor(targetVal);
                        const computedColor = parseColor(computed);
                        if (targetColor && computedColor) {
                            startStyles[prop] = computedColor;
                            endStyles[prop] = targetColor;
                        }
                        else if (isNumeric && /^-?\d+(\.\d+)?([a-z%]*)?$/.test(computed)) {
                            const start = parseFloat(computed);
                            const end = parseFloat(targetVal);
                            const unit = ((_a = computed.match(/[a-z%]+$/i)) === null || _a === void 0 ? void 0 : _a[0]) || '';
                            startStyles[prop] = start;
                            endStyles[prop] = end;
                            units[prop] = unit;
                        }
                        else {
                            startStyles[prop] = null;
                            endStyles[prop] = targetVal;
                        }
                    }
                    const step = (now) => {
                        const t = Math.min(1, (now - startTime) / duration);
                        const eased = easing(t);
                        for (const prop in endStyles) {
                            const start = startStyles[prop];
                            const end = endStyles[prop];
                            if (Array.isArray(start)) {
                                const r = Math.round(start[0] + (end[0] - start[0]) * eased);
                                const g = Math.round(start[1] + (end[1] - start[1]) * eased);
                                const b = Math.round(start[2] + (end[2] - start[2]) * eased);
                                el.style[prop] = `rgb(${r}, ${g}, ${b})`;
                            }
                            else if (typeof start === 'number') {
                                const value = start + (end - start) * eased;
                                el.style[prop] = value + (units[prop] || '');
                            }
                            else {
                                if (t === 1)
                                    el.style[prop] = end;
                            }
                        }
                        if (t < 1) {
                            requestAnimationFrame(step);
                        }
                        else {
                            if (callback)
                                callback();
                            queue.shift();
                            if (queue.length)
                                queue[0]();
                        }
                    };
                    requestAnimationFrame(step);
                });
                if (queue.length === 1)
                    queue[0]();
            });
            return this;
        }
    };
    // Utility function to parse color strings (e.g., rgb, hex) into RGB values
    // This function is used in the animate method to handle color transitions 
    function parseColor(color) {
        const ctx = document.createElement('canvas').getContext('2d');
        if (!ctx)
            return null;
        // Setting fillStyle to the given color
        ctx.fillStyle = color;
        const computed = ctx.fillStyle;
        console.log('computed', computed); // For debugging
        // Handle RGB format
        const rgbMatch = computed.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (rgbMatch) {
            return [
                parseInt(rgbMatch[1]),
                parseInt(rgbMatch[2]),
                parseInt(rgbMatch[3])
            ];
        }
        // Handle RGBA format
        const rgbaMatch = computed.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/);
        if (rgbaMatch) {
            return [
                parseInt(rgbaMatch[1]),
                parseInt(rgbaMatch[2]),
                parseInt(rgbaMatch[3])
            ];
        }
        // Handle hex color formats (#RRGGBB or #RGB)
        const hexMatch = computed.match(/^#([a-fA-F0-9]{3}){1,2}$/);
        if (hexMatch) {
            let hex = hexMatch[0].substring(1); // Strip the '#' from hex
            if (hex.length === 3) {
                hex = hex.split('').map((char) => char + char).join('');
            }
            return [
                parseInt(hex.substring(0, 2), 16),
                parseInt(hex.substring(2, 4), 16),
                parseInt(hex.substring(4, 6), 16)
            ];
        }
        // Check for oklch color format (e.g., "oklch(0.129 0.042 264.695)")
        const oklchMatch = computed.match(/^oklch\((\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)\)$/);
        if (oklchMatch) {
            const L = parseFloat(oklchMatch[1]);
            const C = parseFloat(oklchMatch[2]);
            const H = parseFloat(oklchMatch[3]);
            const [r, g, b] = oklch2rgb([L, C, H]);
            return [r, g, b];
        }
        // Handle color names (e.g., 'red', 'blue', 'green', etc.)
        const colorNames = {
            'red': [255, 0, 0],
            'green': [0, 255, 0],
            'blue': [0, 0, 255],
            // Add more named colors as needed
        };
        if (colorNames[computed]) {
            return colorNames[computed];
        }
        return null;
    }
    // Matrix multiplication function for color conversion
    const multiplyMatrices = (A, B) => {
        return [
            A[0] * B[0] + A[1] * B[1] + A[2] * B[2],
            A[3] * B[0] + A[4] * B[1] + A[5] * B[2],
            A[6] * B[0] + A[7] * B[1] + A[8] * B[2]
        ];
    };
    const oklch2oklab = ([l, c, h]) => [
        l,
        isNaN(h) ? 0 : c * Math.cos(h * Math.PI / 180),
        isNaN(h) ? 0 : c * Math.sin(h * Math.PI / 180)
    ];
    const rgb2srgbLinear = (rgb) => rgb.map(c => Math.abs(c) <= 0.04045 ? c / 12.92 :
        (c < 0 ? -1 : 1) * (((Math.abs(c) + 0.055) / 1.055) ** 2.4));
    const srgbLinear2rgb = (rgb) => rgb.map(c => Math.abs(c) > 0.0031308 ? (c < 0 ? -1 : 1) * (1.055 * (Math.abs(c) ** (1 / 2.4)) - 0.055) :
        12.92 * c);
    const oklab2xyz = (lab) => {
        const LMSg = multiplyMatrices([
            1, 0.3963377773761749, 0.2158037573099136,
            1, -0.1055613458156586, -0.0638541728258133,
            1, -0.0894841775298119, -1.2914855480194092,
        ], lab);
        const LMS = LMSg.map(val => val ** 3);
        return multiplyMatrices([
            1.2268798758459243, -0.5578149944602171, 0.2813910456659647,
            -0.0405757452148008, 1.1122868032803170, -0.0717110580655164,
            -0.0763729366746601, -0.4214933324022432, 1.5869240198367816
        ], LMS);
    };
    const xyz2rgbLinear = (xyz) => {
        return multiplyMatrices([
            3.2409699419045226, -1.537383177570094, -0.4986107602930034,
            -0.9692436362808796, 1.8759675015077202, 0.04155505740717559,
            0.05563007969699366, -0.20397695888897652, 1.0569715142428786
        ], xyz);
    };
    const oklch2rgb = (lch) => {
        // Step 1: Convert OKLCH to OKLAB
        const oklab = oklch2oklab(lch);
        // Step 2: Convert OKLAB to XYZ
        const xyz = oklab2xyz(oklab);
        // Step 3: Convert XYZ to Linear RGB
        const rgbLinear = xyz2rgbLinear(xyz);
        // Step 4: Convert Linear RGB to Standard RGB (gamma corrected)
        return srgbLinear2rgb(rgbLinear);
    };
    return instance;
}
