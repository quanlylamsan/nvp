<select
  value={selectedAnimal}
  onChange={(e) => setSelectedAnimal(e.target.value)}
>

  <option value="">Chọn lâm sản</option>

  {animalProducts.map((item) => (

    <option key={item._id} value={item._id}>
      {item.tenLamSan}
    </option>

  ))}

</select>