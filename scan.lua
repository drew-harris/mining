local names = peripheral.getNames()

print()
print()
print()
print("listing items")

local itemReg = {}

for _, name in pairs(names) do
	-- if name includes minecraft:chest
	if name:find("minecraft:chest") then
		local chest = peripheral.wrap(name)
		if chest == nil then
			print("chest is nil")
			break
		end

		-- report items

		local items = chest.list()
		for _, item in pairs(items) do
			if item.count ~= 0 then
				table.insert(itemReg, {
					chest = name,
					count = item.count,
					name = item.name,
				})
			end
		end
	end
end

print(#itemReg)

-- Get the computer name and include it in the request
local file = fs.open("computer.txt", "r")
local computerName = file.readAll()
file.close()

local requestData = {
    computer = computerName,
    items = itemReg
}

http.post("https://turtle.drewh.net/scan", textutils.serialiseJSON(requestData))
