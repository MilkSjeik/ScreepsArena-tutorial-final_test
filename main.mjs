import { createConstructionSite, getObjectsByPrototype, findClosestByPath } from '/game/utils';
import { Creep, ConstructionSite, Source, StructureContainer, StructureSpawn, StructureTower } from '/game/prototypes';
import { ATTACK, CARRY, HEAL, MOVE, WORK, ERR_NOT_IN_RANGE, ERR_INVALID_TARGET, RESOURCE_ENERGY } from '/game/constants';
import { } from '/arena';

let aMiners = [];
let aBuilders = [];
let aKnights = [];
let aHealers = [];

export function loop() {
    const myCreeps = getObjectsByPrototype(Creep).filter(creep => creep.my);
    const mySpawn = getObjectsByPrototype(StructureSpawn).find(struct => struct.my);
    const constructionSites = getObjectsByPrototype(ConstructionSite).filter(struct => struct.my);
    const containers = getObjectsByPrototype(StructureContainer);
    const sources = getObjectsByPrototype(Source);
    const towers = getObjectsByPrototype(StructureTower).filter(struct => struct.my);

    // Create container near source
    if (constructionSites.length == 0){
        if (containers.length == 0) {
            // lookup source
            const source = findClosestByPath(mySpawn, sources);
            createConstructionSite({x: source.x-1, y: source.y}, StructureContainer);
        }
        else if (towers.length == 0){
            createConstructionSite({x: mySpawn.x-1, y: mySpawn.y}, StructureTower);
        }
    }

    // Spawn creeps
    if (aBuilders.length < 1) {
        if(mySpawn.store[RESOURCE_ENERGY] >= 200) {
            const creep = mySpawn.spawnCreep([WORK, CARRY, MOVE]).object;
            if (creep) {
                creep.role = "builder";
                aBuilders.push(creep);
            }
        }
    }
    else if (aMiners.length < 1) {
        if(mySpawn.store[RESOURCE_ENERGY] >= 250) {
            const creep = mySpawn.spawnCreep([WORK, WORK, MOVE]).object;
            if (creep) {
                creep.role = "miner";
                aMiners.push(creep);
            }
        }
    }
    else if (aKnights.length < 2) {
        if(mySpawn.store[RESOURCE_ENERGY] >= 210) {
            const creep = mySpawn.spawnCreep([ATTACK, ATTACK, MOVE]).object;
            if (creep) {
                creep.role = "knight";
                aMiners.push(creep);
            }
        }
    }
    else if (aHealers.length < 1) {
        if(mySpawn.store[RESOURCE_ENERGY] >= 210) {
            const creep = mySpawn.spawnCreep([HEAL, MOVE, MOVE]).object;
            if (creep) {
                creep.role = "knight";
                aMiners.push(creep);
            }
        }
    }

    // Handle creeps
    myCreeps.forEach(myCreep => {
        console.log("Handle creep: " + myCreep.role);
        if(myCreep.role == "builder") {
            if(constructionSites.length > 0){
                console.log("Found constructionSites!");
                const constructionSite = findClosestByPath(myCreep, constructionSites);

                if(myCreep.store.getFreeCapacity(RESOURCE_ENERGY)){
                    // find closest source
                    const source = findClosestByPath(myCreep, sources);
                    //if(myCreep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    if(myCreep.harvest(source) == ERR_NOT_IN_RANGE){    
                        myCreep.moveTo(source);
                    }
                } else {
                    console.log("Build Time!");
                    const rc = myCreep.build(constructionSite);
                    
                    if(rc == ERR_NOT_IN_RANGE) {
                        myCreep.moveTo(constructionSite);
                    } else if (rc == ERR_INVALID_TARGET) {
                        console.log("Invalid construction site!");
                    }
                    else {
                        console.log("Error when building: " + rc);
                    }
                }
            }
        }
        else if (myCreep.role == "miner") {

        }
        else if (myCreep.role == "knight") {

        }
    });
}
