import React, { useEffect, useRef, useState } from 'react'
// import wkx from 'wkx'
import L, { map } from 'leaflet'

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMapEvent,
} from 'react-leaflet'

import Pane from '../../components/molecule/Pane/Pane'
import styles from './Map.module.scss'
import classNames from 'classnames/bind'
import { Button } from 'antd'
import { getAllStaion } from '../../services/station'
import { useQuery } from '@tanstack/react-query'
import EditPane from '../../components/molecule/EditPane/EditPane'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../services/auth.service'
import { getAllAreas } from '../../services/area'
import LocationMarker from '../../components/atom/LocationMarker/LocationMarker'

import SearchBar from '../../components/atom/SearchBar/SearchBar'
import redLocation from '../../assets/img/red-location.png'
import markerIcon from '../../assets/img/marker-icon.png'
import markerShadow from '../../assets/img/marker-shadow.png'
import Notify from '../../components/molecule/Notify/Notify'
import Routing from '../../components/molecule/Routing'

const cl = classNames.bind(styles)

function Map() {
  let navigate = useNavigate()
  const mapRef = useRef()
  const temporaryMarkerRef = useRef(null)
  const { user: currentUser } = useSelector((state) => state.auth)

  const [showPane, togglePane] = useState(false)
  const [showAddPane, toggleAddPane] = useState(false)
  const [currentStation, setCurrentStation] = useState(null)
  const [temporaryMarker, setTemporaryMarker] = useState(null)
  const [waypoints, setWaypoints] = useState([])

  const stationQuery = useQuery(['stations'], getAllStaion)
  const areaQuery = useQuery(['areas'], getAllAreas)

  const dispatch = useDispatch()

  const addTemporaryMaker = (latlng) => {
    setTemporaryMarker(latlng)
  }

  const handleToggleEditStation = () => {
    togglePane(false)
    toggleAddPane(true)
  }

  const handleLogout = () => {
    dispatch(logout)
    navigate('/')
    window.location.reload()
  }

  const showPopUp = (longitude, latitude) => {
    // return (
    //   <Marker
    //     position={[latitude, longitude]}
    //   >
    //     <Popup>
    //       Lat: {latitude},
    //       <br />
    //       Long: {longitude}
    //     </Popup>
    //   </Marker>
    // )
  }

  const animateRef = useRef(false)

  const RedIcon = L.icon({
    iconUrl: redLocation,
    iconAnchor: [21, 43],
  })

  let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  })

  L.Marker.prototype.options.icon = DefaultIcon

  return (
    <div>
      <MapContainer
        ref={mapRef}
        style={{ width: '100%', height: '100vh' }}
        zoom={11}
        center={[10.5046, 105.19271850585939]}
        scrollWheelZoom={true}
        fadeAnimation={true}
        markerZoomAnimation={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {stationQuery?.data?.map((x, i) => (
          <LocationMarker
            key={i}
            point={x}
            setCurrentStation={setCurrentStation}
            togglePane={togglePane}
            toggleAddPane={toggleAddPane}
          />
        ))}
        {temporaryMarker !== null && (
          <Marker
            icon={RedIcon}
            draggable
            ref={temporaryMarkerRef}
            eventHandlers={{
              dragend() {
                const marker = temporaryMarkerRef.current
                if (marker != null) {
                  setTemporaryMarker([marker._latlng.lat, marker._latlng.lng])
                }
              },
            }}
            position={temporaryMarker}
          ></Marker>
        )}
        {areaQuery.data?.length > 0 &&
          areaQuery.data.map((area) => (
            <GeoJSON key={area._id} data={area.geojson} eventHandlers={{}}>
              <Popup>{area.name}</Popup>
            </GeoJSON>
          ))}
        <SearchBar
          toggleAddPane={toggleAddPane}
          togglePane={togglePane}
          setNewTemporaryMarker={setTemporaryMarker}
          setCurrentStation={setCurrentStation}
          showPopUp={showPopUp}
        />
        <Routing waypoints={waypoints} />
        <Pane
          onEdit={() => handleToggleEditStation()}
          data={currentStation}
          active={showPane}
          onClose={() => togglePane(false)}
          setWaypoints={setWaypoints}
        ></Pane>
        <div className={cl('control-btn')}>
          <Button
            className={cl('add-btn')}
            onClick={() => {
              togglePane(false)
              setCurrentStation(undefined)
              toggleAddPane(true)
            }}
          >
            Thêm mới
          </Button>

          {!currentUser ? (
            <Button onClick={() => navigate('/login')}>Đăng nhập</Button>
          ) : (
            <Button onClick={() => handleLogout()}>Đăng xuất</Button>
          )}
          <Notify></Notify>
        </div>
        <EditPane
          active={showAddPane}
          stationId={
            showAddPane && currentStation?._id ? currentStation._id : undefined
          }
          temporaryMarker={temporaryMarker}
          setNewTemporaryMarker={setTemporaryMarker}
          onClose={() => {
            toggleAddPane(false)
          }}
          onGoToPosition={(latlng) => addTemporaryMaker(latlng)}
          animateRef={animateRef}
        />
      </MapContainer>
    </div>
  )
}

export default Map
