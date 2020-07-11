/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import {Injectable} from "@angular/core";
import {EventPropertyNested, EventPropertyUnion} from "../core-model/gen/streampipes-model";

@Injectable()
export class PropertySelectorService {

    firstStreamPrefix: string = "s0";
    secondStreamPrefix: string = "s1";
    propertyDelimiter: string = "::";

    constructor() {

    }

    makeProperties(eventProperties: Array<any>, availablePropertyKeys: Array<string>, currentPointer) {
        let outputProperties = [];

        eventProperties.forEach(ep => {
            availablePropertyKeys.forEach(apk => {
                if (this.isInSelection(ep, apk, currentPointer)) {
                    ep.runtimeId = this.makeSelector(currentPointer, ep.runtimeName);
                    if (this.isNested(ep)) {
                        ep.eventProperties = this.makeProperties(ep.eventProperties, availablePropertyKeys, this.makeSelector(currentPointer, ep.properties.runtimeName));
                    }
                    outputProperties.push(ep);
                }
            });
        });
        return outputProperties;
    }

    makeFlatProperties(eventProperties: Array<EventPropertyUnion>, availablePropertyKeys: Array<string>) {
        let outputProperties = [];

        availablePropertyKeys.forEach(apk => {
            let keyArray = apk.split("::");
            keyArray.shift();
            outputProperties.push(this.makeProperty(eventProperties, keyArray, apk));
        });
        return outputProperties;
    }

    makeProperty(eventProperties: Array<any>, propertySelector, originalSelector) {
        let outputProperty;
        eventProperties.forEach(ep => {
            if (ep.runtimeName === propertySelector[0]) {
                if (this.isNested(ep)) {
                    propertySelector.shift();
                    outputProperty = this.makeProperty(ep.eventProperties, propertySelector, originalSelector);
                } else {
                    ep.runtimeId = originalSelector;
                    outputProperty = ep;
                    outputProperty.properties.niceLabel = this.makeNiceLabel(originalSelector);
                }
            }
        });
        return outputProperty;
    }

    makeNiceLabel(originalSelector) {
        return originalSelector.split("::").join(" \u{21D2} ");
    }

    isNested(ep) {
        return ep instanceof EventPropertyNested;
    }

    isInSelection(inputProperty: EventPropertyUnion, propertySelector, currentPropertyPointer) {
        return (currentPropertyPointer
            + this.propertyDelimiter
            + inputProperty.runtimeName) === propertySelector;

    }

    makeSelector(prefix, current) {
        return prefix + this.propertyDelimiter + current;
    }
}