/*! *****************************************************************************
Copyright (c) 2017 Tangra Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
***************************************************************************** */
import { CoercibleProperty, Property } from "ui/core/view";
import { Cache } from "ui/image-cache";
import { ItemsSource } from "ui/list-picker";
import { ScrollView } from "ui/scroll-view";
import { ImageAccessor, ImageSwipe as ImageSwipeDefinition } from ".";

export * from "ui/scroll-view";

class DefaultImageAccessor implements ImageAccessor {
    private static _imageCacheInstance: Cache;
    
    constructor() {
        if (!DefaultImageAccessor._imageCacheInstance) {
            DefaultImageAccessor._imageCacheInstance = new Cache();
            DefaultImageAccessor._imageCacheInstance.maxRequests = 3;
        }    
    }

    public getImage(imageUrl: string): any {
        return DefaultImageAccessor._imageCacheInstance.get(imageUrl);
    }

    public loadImage(imageUrl: string, callback: (image: any) => void): void {
        DefaultImageAccessor._imageCacheInstance.push({
            url: imageUrl,
            key: imageUrl,
            completed: callback
        });
    }    
}

export abstract class ImageSwipeBase extends ScrollView implements ImageSwipeDefinition {
    public static pageChangedEvent: string = "pageChanged";
    private static _defaultImageAccessor: ImageAccessor;
    
    public items: any[] | ItemsSource;
    public pageNumber: number;
    public imageUrlProperty: string;
    public isItemsSourceIn: boolean;
    public allowZoom: boolean;
    public imageAccessor: ImageAccessor;

    constructor() {
        super();
    }

    public get _imageAccessor(): ImageAccessor {
        if (this.imageAccessor) {
            return this.imageAccessor;
        } 
        if (!ImageSwipeBase._defaultImageAccessor) {
            ImageSwipeBase._defaultImageAccessor = new DefaultImageAccessor();
        }

        return ImageSwipeBase._defaultImageAccessor;
    }

    public _getDataItem(index: number): any {
        return this.isItemsSourceIn ? (this.items as ItemsSource).getItem(index) : this.items[index];
    }

    public nextPage(): void {
        this.pageNumber ++;
    }

    public prevPage(): void {
        this.pageNumber --;
    }
}

export const pageNumberProperty = new CoercibleProperty<ImageSwipeBase, number>({
    name: "pageNumber",
    defaultValue: 0,
    valueConverter: (v) => parseInt(v, 10),
    coerceValue: (target, value) => {
        const items = target.items;
        if (items && items.length !== 0) {
            const max = items.length - 1;
            if (value < 0) {
                value = 0;
            }
            if (value > max) {
                value = max;
            }
        }
        else {
            value = null;
        }

        return value;
    }
});
pageNumberProperty.register(ImageSwipeBase);

export const itemsProperty = new Property<ImageSwipeBase, any[] | ItemsSource>({
    name: "items",
    valueChanged: (target, oldValue, newValue) => {
        const getItem = newValue && (newValue as ItemsSource).getItem;

        target.isItemsSourceIn = typeof getItem === "function";
    }
});
itemsProperty.register(ImageSwipeBase);

export const imageUrlPropertyProperty = new Property<ImageSwipeBase, string>({
    name: "imageUrlProperty",
    defaultValue: ""
});
imageUrlPropertyProperty.register(ImageSwipeBase);

export const allowZoomProperty = new Property<ImageSwipeBase, boolean>({
    name: "allowZoom",
    defaultValue: true
});
allowZoomProperty.register(ImageSwipeBase);

export const loadImageProperty = new Property<ImageSwipeBase, ImageAccessor>({
    name: "imageAccessor",
    defaultValue: null
});
loadImageProperty.register(ImageSwipeBase);
