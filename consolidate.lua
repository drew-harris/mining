local args = {...}
if #args < 1 then
    print("Usage: consolidate <item_name>")
    return
end

local targetItem = args[1]
print("Debug: Looking for item: " .. targetItem)

local names = peripheral.getNames()
print("Debug: Found peripherals: " .. table.concat(names, ", "))

local frontChestName = "front"
print("Debug: Using 'front' as the front chest name")
local frontChest = peripheral.wrap(frontChestName)

if not frontChest then
    print("Error: No chest found in front")
    return
end

-- Function to move items from source to target chest
local function moveItems(sourceChest, targetChestName, itemName)
    print("Debug: Checking chest: " .. peripheral.getName(sourceChest))
    local items = sourceChest.list()
    local moved = 0
    
    for slot, item in pairs(items) do
        print("Debug: Slot " .. slot .. " contains: " .. item.name .. " (count: " .. item.count .. ")")
        if item.name == itemName then
            print("Debug: Found matching item in slot " .. slot)
            local amount = sourceChest.pushItems(targetChestName, slot)
            print("Debug: pushItems returned: " .. amount)
            moved = moved + amount
        end
    end
    
    return moved
end

-- Check all chests in the network
print("Debug: Starting to check all chests in network")
for _, name in pairs(names) do
    if name:find("minecraft:chest") and name ~= frontChestName then
        print("Debug: Found chest: " .. name)
        local chest = peripheral.wrap(name)
        if chest then
            local moved = moveItems(chest, frontChestName, targetItem)
            print("Moved " .. moved .. " items from " .. name)
        else
            print("Debug: Failed to wrap chest: " .. name)
        end
    end
end

print("Consolidation complete!") 