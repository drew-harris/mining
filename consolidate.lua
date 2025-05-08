local args = {...}
if #args < 1 then
    print("Usage: consolidate <item_name> [amount]")
    return
end

local targetItem = args[1]
local targetAmount = args[2] and tonumber(args[2]) or nil
print("Debug: Looking for item: " .. targetItem)
if targetAmount then
    print("Debug: Target amount: " .. targetAmount)
end

local names = peripheral.getNames()
print("Debug: Found peripherals: " .. table.concat(names, ", "))

-- Find the only barrel on the network
local barrelName = nil
for _, name in pairs(names) do
    if peripheral.getType(name) == "barrel" or (name:find("minecraft:barrel")) then
        if barrelName then
            print("Error: More than one barrel found on the network!")
            return
        end
        barrelName = name
    end
end

if not barrelName then
    print("Error: No barrel found on the network!")
    return
end

print("Debug: Using barrel '" .. barrelName .. "' as the consolidation target.")
local barrel = peripheral.wrap(barrelName)

-- Function to move items from source to barrel
local function moveItemsToBarrel(sourceChestName, itemName)
    if sourceChestName == barrelName then return 0 end
    local sourceChest = peripheral.wrap(sourceChestName)
    if not sourceChest then
        print("Debug: Could not wrap source chest: " .. sourceChestName)
        return 0
    end
    print("Debug: Checking chest: " .. sourceChestName)
    local items = sourceChest.list()
    local moved = 0
    for slot, item in pairs(items) do
        if item.name == itemName then
            print("Debug: Found matching item in slot " .. slot)
            local amountToMove = targetAmount and math.min(item.count, targetAmount - moved) or item.count
            if amountToMove <= 0 then break end
            
            local ok, amount = pcall(function() return sourceChest.pushItems(barrelName, slot, amountToMove) end)
            if ok then
                print("Debug: pushItems returned: " .. tostring(amount))
                moved = moved + amount
                if targetAmount and moved >= targetAmount then
                    break
                end
            else
                print("Error: pushItems failed for " .. sourceChestName .. " slot " .. slot .. ": " .. tostring(amount))
            end
        end
    end
    return moved
end

-- Check all chests in the network and move items to the barrel
print("Debug: Starting to check all chests in network")
for _, name in pairs(names) do
    if (peripheral.getType(name) == "chest" or name:find("minecraft:chest")) and name ~= barrelName then
        print("Debug: Found chest: " .. name)
        local moved = moveItemsToBarrel(name, targetItem)
        print("Moved " .. moved .. " items from " .. name)
    end
end

print("Consolidation complete!") 